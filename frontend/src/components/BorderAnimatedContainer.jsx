import { useThemeStore } from "../store/useThemeStore";

function BorderAnimatedContainer({ children }) {
  const { getTheme } = useThemeStore();
  const currentTheme = getTheme();
  const color = currentTheme.color || "#06b6d4";

  return (
    <div
      className="w-full h-full rounded-2xl border border-transparent animate-border flex overflow-hidden transition-all duration-700"
      style={{
        background: `linear-gradient(45deg, #172033, rgba(30, 41, 59, 1) 50%, #172033) padding-box, conic-gradient(from var(--border-angle), rgba(71, 85, 105, 0.48) 80%, ${color} 86%, #ffffff 90%, ${color} 94%, rgba(71, 85, 105, 0.48)) border-box`,
      }}
    >
      {children}
    </div>
  );
}

export default BorderAnimatedContainer;