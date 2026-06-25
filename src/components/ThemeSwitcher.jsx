import { useTheme } from "../context/ThemeContext";

const OPTIONS = [
  { id: "light", label: "Light", icon: "☼" },
  { id: "dark", label: "Dark", icon: "☾" },
  { id: "contrast", label: "High contrast", icon: "◐" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher" role="group" aria-label="Theme">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`theme-switcher__btn ${theme === opt.id ? "is-active" : ""}`}
          aria-pressed={theme === opt.id}
          onClick={() => setTheme(opt.id)}
          title={opt.label}
        >
          <span aria-hidden="true">{opt.icon}</span>
          <span className="sr-only">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
