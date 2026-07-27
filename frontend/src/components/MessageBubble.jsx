import { useState } from "react";
import { ReplyIcon, SmileIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import MessageStatus from "./MessageStatus";
import ReplyPreview from "./ReplyPreview";

const PRESET_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function MessageBubble({ msg, authUser, onScrollToMessage }) {
  const { setReplyingTo, addReaction, removeReaction } = useChatStore();
  const [showPicker, setShowPicker] = useState(false);

  const isSentByMe = msg.senderId === authUser._id;
  const reactions = msg.reactions || [];

  // Group reactions by emoji to show count and whether I reacted
  const groupedReactions = reactions.reduce((acc, r) => {
    const rUserId = typeof r.userId === "object" ? r.userId._id : r.userId;
    if (!acc[r.emoji]) {
      acc[r.emoji] = { count: 0, iReacted: false };
    }
    acc[r.emoji].count += 1;
    if (rUserId === authUser._id) {
      acc[r.emoji].iReacted = true;
    }
    return acc;
  }, {});

  const handleEmojiClick = (emoji) => {
    // Check if I already reacted with this emoji
    const myReaction = reactions.find((r) => {
      const rUserId = typeof r.userId === "object" ? r.userId._id : r.userId;
      return rUserId === authUser._id && r.emoji === emoji;
    });

    if (myReaction) {
      removeReaction(msg._id);
    } else {
      addReaction(msg._id, emoji);
    }
    setShowPicker(false);
  };

  const handleReactionBadgeClick = (emoji, iReacted) => {
    if (iReacted) {
      removeReaction(msg._id);
    } else {
      addReaction(msg._id, emoji);
    }
  };

  return (
    <div
      className={`chat ${isSentByMe ? "chat-end" : "chat-start"} group relative ${
        Object.keys(groupedReactions).length > 0 ? "mb-4" : "mb-2"
      }`}
      onMouseLeave={() => setShowPicker(false)}
    >
      {/* Main Message Bubble */}
      <div
        className={`chat-bubble relative overflow-visible flex flex-col shadow-md ${
          isSentByMe ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"
        }`}
      >
        {/* Floating actions menu (Reply + Emoji buttons) directly next to bubble on hover */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 z-20 ${
            isSentByMe ? "right-full mr-2.5" : "left-full ml-2.5"
          }`}
        >
          <button
            type="button"
            onClick={() => setReplyingTo(msg)}
            className="p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-all shadow-md hover:scale-105"
            title="Reply"
          >
            <ReplyIcon className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-all shadow-md hover:scale-105"
              title="React"
            >
              <SmileIcon className="w-3.5 h-3.5" />
            </button>

            {/* Floating Emoji Picker Bar */}
            {showPicker && (
              <div
                className={`absolute bottom-full mb-2 flex items-center gap-1 p-1.5 bg-slate-900 border border-slate-700 rounded-full shadow-2xl z-30 animate-pop ${
                  isSentByMe ? "right-0" : "left-0"
                }`}
              >
                {PRESET_EMOJIS.map((emoji) => {
                  const isSelected = groupedReactions[emoji]?.iReacted;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full hover:scale-125 transition-transform text-sm ${
                        isSelected ? "bg-cyan-500/30 ring-1 ring-cyan-400" : "hover:bg-slate-800"
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quoted Reply Preview inside bubble */}
        {msg.replyTo && (
          <ReplyPreview
            message={msg.replyTo}
            inBubble={true}
            onScrollToMessage={onScrollToMessage}
          />
        )}

        {msg.image && (
          <img
            src={msg.image}
            alt="Shared"
            className="rounded-lg max-h-60 object-cover mt-1 mb-1 border border-slate-700/30"
          />
        )}
        {msg.text && <p className="text-sm md:text-base leading-relaxed break-words">{msg.text}</p>}

        <div className="text-[10px] mt-1 opacity-75 flex items-center justify-end gap-1 self-end">
          <span>
            {new Date(msg.createdAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {/* Show read receipt ticks only for messages I sent */}
          {isSentByMe && <MessageStatus status={msg.status} />}
        </div>

        {/* Emoji Reaction Badges overlapping bottom border like WhatsApp/Telegram */}
        {Object.keys(groupedReactions).length > 0 && (
          <div
            className={`absolute -bottom-2.5 flex flex-wrap items-center gap-1 z-20 ${
              isSentByMe ? "left-2.5" : "right-2.5"
            }`}
          >
            {Object.entries(groupedReactions).map(([emoji, { count, iReacted }]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReactionBadgeClick(emoji, iReacted)}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold border shadow-md transition-all hover:scale-110 select-none ${
                  iReacted
                    ? "bg-slate-900 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/30"
                    : "bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500"
                }`}
                title={iReacted ? "Click to remove reaction" : "Click to react"}
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-[10px] ml-0.5 text-slate-300">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
