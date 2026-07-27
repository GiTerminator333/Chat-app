import { useRef, useState, useEffect, useCallback } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, SmileIcon, XIcon } from "lucide-react";
import ReplyPreview from "./ReplyPreview";

// How long to wait after the last keystroke before emitting "stopTyping" (ms)
const TYPING_TIMEOUT_MS = 1500;

// Simple, clean preset grid of popular emojis for typing
const QUICK_EMOJIS = [
  "😊", "😂", "🥰", "😎", "🤔", "😢", "😡", "👍",
  "👎", "❤️", "🔥", "🎉", "✨", "🙏", "👋", "💯"
];

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, isSoundEnabled, selectedUser, replyingTo } = useChatStore();
  const { socket } = useAuthStore();

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  /**
   * Emit "typing" event and set a debounce timer that
   * emits "stopTyping" after TYPING_TIMEOUT_MS of inactivity.
   */
  const handleTypingEmit = useCallback(() => {
    if (!socket || !selectedUser) return;

    socket.emit("typing", { receiverId: selectedUser._id });

    // Reset the debounce timer
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }, TYPING_TIMEOUT_MS);
  }, [socket, selectedUser]);

  /** Immediately stop the typing indicator (e.g., on send) */
  const stopTypingNow = useCallback(() => {
    if (!socket || !selectedUser) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stopTyping", { receiverId: selectedUser._id });
  }, [socket, selectedUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    // Stop typing indicator before sending
    stopTypingNow();
    setShowEmojiPicker(false);

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    handleTypingEmit();
  };

  return (
    <div className="border-t border-slate-700/50 bg-slate-900/20 relative">
      {replyingTo && <ReplyPreview message={replyingTo} inBubble={false} />}
      <div className="p-4">
        {imagePreview && (
          <div className="max-w-3xl mx-auto mb-3 flex items-center">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-slate-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center space-x-2 md:space-x-3">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
              handleTypingEmit();
            }}
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4 text-slate-200"
            placeholder={replyingTo ? "Type a reply..." : "Type your message..."}
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Emoji selector dropdown toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg p-2.5 transition-colors ${
                showEmojiPicker ? "text-cyan-400 bg-slate-800" : ""
              }`}
              title="Add emoji"
            >
              <SmileIcon className="w-5 h-5" />
            </button>

            {/* Quick Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-48 grid grid-cols-4 gap-1 z-30">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-lg flex items-center justify-center transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg p-2.5 transition-colors ${
              imagePreview ? "text-cyan-500 bg-slate-800" : ""
            }`}
            title="Attach image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
export default MessageInput;