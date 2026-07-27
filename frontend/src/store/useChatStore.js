import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  // Typing indicator state — { [userId]: true } for users currently typing
  typingUsers: {},

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      status: "sent",
      isOptimistic: true, 
    };
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  // --- Read Receipts ---

  /**
   * Mark all messages from a specific sender as "read".
   * Called when opening a conversation to acknowledge received messages.
   */
  markMessagesAsRead: async (senderId) => {
    try {
      await axiosInstance.put(`/messages/read/${senderId}`);

      // Update local message statuses immediately for a snappy UI
      const currentMessages = get().messages;
      const updatedMessages = currentMessages.map((msg) =>
        msg.senderId === senderId && msg.status !== "read"
          ? { ...msg, status: "read" }
          : msg
      );
      set({ messages: updatedMessages });
    } catch (error) {
      console.log("Error marking messages as read:", error.message);
    }
  },

  // --- Socket Subscriptions ---

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Listen for new incoming messages
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0; 
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    // Listen for read receipt confirmations (sender sees their ticks turn cyan)
    socket.on("messagesRead", ({ readBy }) => {
      if (readBy !== selectedUser._id) return;

      const currentMessages = get().messages;
      const updatedMessages = currentMessages.map((msg) =>
        msg.receiverId === readBy && msg.status !== "read"
          ? { ...msg, status: "read" }
          : msg
      );
      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesRead");
  },

  // --- Typing Indicator Socket Events ---

  subscribeToTypingEvents: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("userTyping", ({ senderId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: true }
      }));
    });

    socket.on("userStoppedTyping", ({ senderId }) => {
      set((state) => {
        const updated = { ...state.typingUsers };
        delete updated[senderId];
        return { typingUsers: updated };
      });
    });
  },

  unsubscribeFromTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("userTyping");
    socket.off("userStoppedTyping");
  },
}));