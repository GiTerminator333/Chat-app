import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { getAvatarUrl } from "../lib/avatar";

function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id];

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  // Determine the status text and style
  const getStatusDisplay = () => {
    if (isTyping) return <span className="text-cyan-400 text-xs">typing…</span>;
    if (isOnline) return <span className="text-slate-400 text-xs">Online</span>;
    return <span className="text-slate-400 text-xs">Offline</span>;
  };

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 h-16 min-h-[64px] px-6 shrink-0">
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-10 h-10 rounded-full">
            <img src={getAvatarUrl(selectedUser.profilePic, selectedUser.fullName)} alt={selectedUser.fullName} />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium text-sm">{selectedUser.fullName}</h3>
          {getStatusDisplay()}
        </div>
      </div>

      <button
        onClick={() => setSelectedUser(null)}
        title="Close chat"
        className="text-slate-400 hover:text-slate-200 transition-colors p-1"
      >
        <XIcon className="w-5 h-5 cursor-pointer" />
      </button>
    </div>
  );
}

export default ChatHeader;