import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import TypingIndicator from "./TypingIndicator";
import MessageStatus from "./MessageStatus";

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
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    subscribeToTypingEvents();

    // Mark all messages from this user as "read" when opening the chat
    markMessagesAsRead(selectedUser._id);

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTypingEvents();
    };
  }, [
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsRead,
    subscribeToTypingEvents,
    unsubscribeFromTypingEvents,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isSentByMe = msg.senderId === authUser._id;

              return (
                <div
                  key={msg._id}
                  className={`chat ${isSentByMe ? "chat-end" : "chat-start"}`}
                >
                  <div
                    className={`chat-bubble relative ${
                      isSentByMe
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {msg.image && (
                      <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                    )}
                    {msg.text && <p className="mt-2">{msg.text}</p>}
                    <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {/* Show read receipt ticks only for messages I sent */}
                      {isSentByMe && <MessageStatus status={msg.status} />}
                    </p>
                  </div>
                </div>
              );
            })}
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