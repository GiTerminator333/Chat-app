import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import TypingIndicator from "./TypingIndicator";
import MessageBubble from "./MessageBubble";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsRead,
    subscribeToTypingEvents,
    unsubscribeFromTypingEvents,
    clearReplyingTo,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messageRefs = useRef({});

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    subscribeToTypingEvents();

    // Mark all messages from this user as "read" when opening the chat
    markMessagesAsRead(selectedUser._id);
    clearReplyingTo();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTypingEvents();
      clearReplyingTo();
    };
  }, [
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsRead,
    subscribeToTypingEvents,
    unsubscribeFromTypingEvents,
    clearReplyingTo,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScrollToMessage = (messageId) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-cyan-400", "bg-slate-800/60");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-cyan-400", "bg-slate-800/60");
      }, 1500);
    }
  };

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-6">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg._id}
                ref={(el) => (messageRefs.current[msg._id] = el)}
                className="transition-all duration-500 rounded-xl px-2 py-0.5"
              >
                <MessageBubble
                  msg={msg}
                  authUser={authUser}
                  onScrollToMessage={handleScrollToMessage}
                />
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      {/* Typing indicator appears just above the input bar */}
      <TypingIndicator />
      <MessageInput />
    </>
  );
}

export default ChatContainer;