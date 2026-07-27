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

  // Typing & recording indicator state — { [userId]: true } for active users
  typingUsers: {},
  recordingUsers: {},
  // Message currently being replied to
  replyingTo: null,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setReplyingTo: (msg) => set({ replyingTo: msg }),
  clearReplyingTo: () => set({ replyingTo: null }),

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
    const { selectedUser, messages, replyingTo } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      voice: messageData.voice,
      replyTo: replyingTo || null,
      createdAt: new Date().toISOString(),
      status: "sent",
      isOptimistic: true,
      reactions: [],
    };
    set({ messages: [...messages, optimisticMessage], replyingTo: null });

    try {
      const payload = {
        ...messageData,
        replyTo: replyingTo ? replyingTo._id : undefined,
      };
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      set((state) => ({
        messages: state.messages.map((m) => (m._id === tempId ? res.data : m)),
      }));
    } catch (error) {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== tempId),
      }));
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  // --- Emoji Reactions ---

  addReaction: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: res.data.reactions } : msg
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add reaction");
    }
  },

  removeReaction: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/react/${messageId}`);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: res.data.reactions } : msg
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove reaction");
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

      // Instantly acknowledge read receipt since this chat window is active & open
      get().markMessagesAsRead(selectedUser._id);

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

    // Listen for real-time message emoji reaction updates
    socket.on("messageReaction", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesRead");
    socket.off("messageReaction");
  },

  // --- Typing Indicator Socket Events ---

  subscribeToTypingEvents: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("userTyping", ({ senderId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: true },
        recordingUsers: { ...state.recordingUsers, [senderId]: false }
      }));
    });

    socket.on("userStoppedTyping", ({ senderId }) => {
      set((state) => {
        const updated = { ...state.typingUsers };
        delete updated[senderId];
        return { typingUsers: updated };
      });
    });

    socket.on("userRecordingVoice", ({ senderId }) => {
      set((state) => ({
        recordingUsers: { ...state.recordingUsers, [senderId]: true },
        typingUsers: { ...state.typingUsers, [senderId]: false }
      }));
    });

    socket.on("userStoppedRecordingVoice", ({ senderId }) => {
      set((state) => {
        const updated = { ...state.recordingUsers };
        delete updated[senderId];
        return { recordingUsers: updated };
      });
    });
  },

  unsubscribeFromTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("userRecordingVoice");
    socket.off("userStoppedRecordingVoice");
  },
}));