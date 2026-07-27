import { XIcon, CheckIcon } from "lucide-react";
import { useThemeStore, THEMES } from "../store/useThemeStore";

function ThemeModal() {
  const { theme, setTheme, isThemeModalOpen, closeThemeModal } = useThemeStore();

  if (!isThemeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div
        className="w-full max-w-lg bg-slate-900/95 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Accent theme</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an accent color for primary actions, glow lighting, and active chat elements.
            </p>
          </div>

          <button
            onClick={closeThemeModal}
            className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Color Palette Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 py-6">
          {THEMES.map((item) => {
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all ${
                  isSelected
                    ? "ring-2 ring-cyan-400 bg-slate-800/80 scale-105"
                    : "hover:bg-slate-800/40 hover:scale-105"
                }`}
              >
                <div
                  className="size-12 rounded-full flex items-center justify-center shadow-lg transition-transform relative"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: isSelected ? `0 0 16px ${item.color}` : "none",
                  }}
                >
                  {isSelected && (
                    <div className="bg-black/30 rounded-full p-1 text-white">
                      <CheckIcon className="size-5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <span
                  className={`text-xs font-medium ${
                    isSelected ? "text-slate-100 font-semibold" : "text-slate-400"
                  }`}
                >
                  {item.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={closeThemeModal}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemeModal;
