import { useChatStore } from "../store/useChatStore";

/**
 * TypingIndicator — Shows a "typing..." animation with bouncing dots
 * when the selected user is currently typing.
 * 
 * Renders nothing if the selected user is not typing.
 */
function TypingIndicator() {
  const { selectedUser, typingUsers } = useChatStore();

  // Only show if the selected user is actively typing
  const isTyping = selectedUser && typingUsers[selectedUser._id];

  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="typing-indicator-dots">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="text-sm text-slate-400 italic">typing…</span>
    </div>
  );
}

export default TypingIndicator;
