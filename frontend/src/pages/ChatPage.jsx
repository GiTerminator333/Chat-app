import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import TopNavbar from "../components/TopNavbar";
import ThemeModal from "../components/ThemeModal";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  const { getTheme } = useThemeStore();
  const currentTheme = getTheme();

  return (
    <div className="relative w-[94vw] max-w-6xl h-[85vh] max-h-[780px] min-h-[580px] flex flex-col">
      <ThemeModal />
      <BorderAnimatedContainer>
        <div
          className="w-full h-full flex flex-col overflow-hidden backdrop-blur-md transition-colors duration-700 relative"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.85)" }}
        >
          {/* Dynamic Theme Color Background Tint Overlay */}
          <div
            className="absolute inset-0 transition-all duration-700 pointer-events-none z-0"
            style={{ backgroundColor: currentTheme.panelTint || "transparent" }}
          />

          {/* TOP NAVIGATION BAR */}
          <TopNavbar showChatControls={true} />

          {/* MAIN CHAT CONTENT AREA */}
          <div className="flex-1 flex overflow-hidden min-h-0 z-10">
            {/* LEFT SIDEBAR */}
            <div className="w-72 md:w-80 shrink-0 bg-slate-800/40 backdrop-blur-sm flex flex-col border-r border-slate-700/30">
              <ProfileHeader />
              <ActiveTabSwitch />

              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
                {activeTab === "chats" ? <ChatsList /> : <ContactList />}
              </div>
            </div>

            {/* RIGHT CHAT AREA */}
            <div className="flex-1 flex flex-col bg-slate-900/40 backdrop-blur-sm overflow-hidden min-w-0">
              {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
            </div>
          </div>
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;