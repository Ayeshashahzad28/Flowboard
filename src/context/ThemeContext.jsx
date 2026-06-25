import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { KEYS, readJSON, writeJSON } from "../utils/storage";

const ThemeContext = createContext(null);

const THEMES = ["light", "dark", "contrast"];

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = readJSON(KEYS.THEME, null);
    if (stored && THEMES.includes(stored)) return stored;
    return getSystemTheme();
  });
  const [followSystem, setFollowSystem] = useState(
    () => readJSON(KEYS.THEME, null) === null,
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme =
      theme === "light" ? "light" : "dark";
  }, [theme]);

  useEffect(() => {
    if (!followSystem || typeof window === "undefined" || !window.matchMedia)
      return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setThemeState(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [followSystem]);

  const setTheme = (next) => {
    setFollowSystem(false);
    setThemeState(next);
    writeJSON(KEYS.THEME, next);
  };

  const resetToSystem = () => {
    setFollowSystem(true);
    writeJSON(KEYS.THEME, null);
    setThemeState(getSystemTheme());
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      followSystem,
      resetToSystem,
      availableThemes: THEMES,
    }),
    [theme, followSystem],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
