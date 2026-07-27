import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();
  const { getTheme } = useThemeStore();
  const currentTheme = getTheme();

  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab font-medium transition-colors ${
          activeTab === "chats"
            ? `bg-slate-800/80 ${currentTheme.textClass}`
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab font-medium transition-colors ${
          activeTab === "contacts"
            ? `bg-slate-800/80 ${currentTheme.textClass}`
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;