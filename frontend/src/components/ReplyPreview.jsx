import { XIcon, ReplyIcon, ImageIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

/**
 * ReplyPreview — Displays a quoted message preview.
 * 
 * Can be used in two places:
 * 1. Inside a message bubble (inBubble = true): displays above the reply text, clickable to scroll to original.
 * 2. Above the MessageInput bar (inBubble = false): displays when user is preparing a reply, with an 'X' button to cancel.
 */
function ReplyPreview({ message, inBubble = false, onScrollToMessage }) {
  const { clearReplyingTo, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();

  if (!message) return null;

  // Determine sender display name
  const senderId = typeof message.senderId === "object" ? message.senderId._id : message.senderId;
  const isMe = senderId === authUser?._id;
  const senderName = isMe ? "You" : (selectedUser?.fullName || "User");

  if (inBubble) {
    return (
      <div
        onClick={() => onScrollToMessage && onScrollToMessage(message._id)}
        className="mb-1 p-2 rounded bg-slate-900/40 border-l-4 border-cyan-400 text-xs cursor-pointer hover:bg-slate-900/60 transition-colors select-none"
      >
        <p className="font-semibold text-cyan-300 mb-0.5">{senderName}</p>
        {message.text ? (
          <p className="text-slate-300 truncate max-w-[240px]">{message.text}</p>
        ) : message.image ? (
          <p className="text-slate-300 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Photo
          </p>
        ) : null}
      </div>
    );
  }

  // Preview bar above MessageInput
  return (
    <div className="bg-slate-800/80 backdrop-blur border-t border-slate-700/50 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-full shrink-0">
          <ReplyIcon className="w-4 h-4" />
        </div>
        <div className="overflow-hidden text-xs">
          <span className="font-semibold text-cyan-400 block">Replying to {senderName}</span>
          <p className="text-slate-300 truncate max-w-lg">
            {message.text || (message.image ? "📷 Photo" : "Message")}
          </p>
        </div>
      </div>
      <button
        onClick={clearReplyingTo}
        type="button"
        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-full transition-colors shrink-0"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export default ReplyPreview;
