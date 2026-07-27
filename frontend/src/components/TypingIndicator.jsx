import { useChatStore } from "../store/useChatStore";
import { MicIcon } from "lucide-react";

/**
 * TypingIndicator — Shows an animated status badge just above the message input bar
 * when the selected chat partner is either actively typing or recording a voice note.
 * 
 * Renders nothing if neither activity is occurring.
 */
function TypingIndicator() {
  const { selectedUser, typingUsers, recordingUsers } = useChatStore();

  if (!selectedUser) return null;

  const isTyping = typingUsers[selectedUser._id];
  const isRecording = recordingUsers[selectedUser._id];

  if (!isTyping && !isRecording) return null;

  const firstName = selectedUser.fullName
    ? selectedUser.fullName.split(" ")[0]
    : "User";

  if (isRecording) {
    return (
      <div className="px-6 py-2 flex items-center gap-2.5 transition-all duration-300">
        <div className="bg-slate-800/90 border border-red-500/40 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 voice-recording-dot shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
          <span className="w-1 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }} />
          <span className="w-1 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.8s" }} />
          <span className="w-1 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.8s" }} />
        </div>
        <span className="text-sm text-red-400/90 font-medium italic">
          {firstName} is recording a voice message...
        </span>
      </div>
    );
  }

  return (
    <div className="px-6 py-2 flex items-center gap-2.5 transition-all duration-300">
      <div className="bg-slate-800/90 border border-slate-700/60 px-3 py-1.5 rounded-full shadow-md flex items-center justify-center">
        <div className="typing-indicator-dots">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
      <span className="text-sm text-slate-400 font-medium italic">
        {firstName} is typing...
      </span>
    </div>
  );
}

export default TypingIndicator;
