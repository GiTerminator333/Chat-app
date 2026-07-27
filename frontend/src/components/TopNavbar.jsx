import {
  ZapIcon,
  PaletteIcon,
  Volume2Icon,
  VolumeOffIcon,
} from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function TopNavbar() {
  const { openThemeModal } = useThemeStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  return (
    <div className="w-full h-12 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* LEFT: ZapChat Branding with Tagline below */}
      <div className="flex items-center gap-2.5">
        <div className="size-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-sm shadow-cyan-500/30">
          <ZapIcon className="size-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold tracking-wide text-slate-100 leading-tight">
            ZapChat
          </span>
          <span className="text-[10px] text-slate-400 font-medium leading-tight">
            Instant. Secure. Connected.
          </span>
        </div>
      </div>

      {/* RIGHT: Permanent Header Utility Actions */}
      <div className="flex items-center gap-2">
        {/* Accent Theme Palette Button */}
        <button
          onClick={openThemeModal}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors relative group"
          title="Accent theme picker"
        >
          <PaletteIcon className="size-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        </button>

        {/* Permanent Sound / Keyboard Noise Toggle */}
        <button
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors"
          title={isSoundEnabled ? "Mute keyboard sound" : "Enable keyboard sound"}
          onClick={() => {
            mouseClickSound.currentTime = 0;
            mouseClickSound.play().catch(() => {});
            toggleSound();
          }}
        >
          {isSoundEnabled ? (
            <Volume2Icon className="size-4 text-cyan-400" />
          ) : (
            <VolumeOffIcon className="size-4 text-slate-500" />
          )}
        </button>
      </div>
    </div>
  );
}

export default TopNavbar;
