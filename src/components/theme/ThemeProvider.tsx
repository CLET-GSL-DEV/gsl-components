import { useCallback, useEffect, useMemo, useState } from "react";
import type { CletTheme, ThemeProviderProps } from "../../types/theme";
import { getSystemTheme, resolveTheme } from "./resolveTheme";
import { ThemeContext } from "./ThemeContext";

export function ThemeProvider({
  theme: controlledTheme,
  defaultTheme = "system",
  onThemeChange,
  storageKey = "clet-theme",
  className,
  style,
  children,
}: ThemeProviderProps) {
  const resolvedDefault = useMemo(() => {
    if (!storageKey) return defaultTheme;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch {
      // localStorage unavailable
    }
    return defaultTheme;
  }, [storageKey, defaultTheme]);

  const [uncontrolledTheme, setUncontrolledTheme] =
    useState<CletTheme>(resolvedDefault);
  const isControlled = controlledTheme !== undefined;
  const theme = isControlled ? controlledTheme : uncontrolledTheme;
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemTheme(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const resolvedTheme = useMemo(
    () => (theme === "system" ? systemTheme : resolveTheme(theme)),
    [theme, systemTheme],
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-clet-theme", resolvedTheme);

    return () => {
      document.documentElement.removeAttribute("data-clet-theme");
    };
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (nextTheme: CletTheme) => {
      if (isControlled) {
        onThemeChange?.(nextTheme);
        return;
      }

      setUncontrolledTheme(nextTheme);
      try {
        if (storageKey) localStorage.setItem(storageKey, nextTheme);
      } catch {
        // localStorage unavailable
      }
      onThemeChange?.(nextTheme);
    },
    [isControlled, onThemeChange, storageKey],
  );

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme],
  );

  const rootClass = ["clet-theme", className].filter(Boolean).join(" ");

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={rootClass} data-clet-theme={resolvedTheme} style={style} suppressHydrationWarning>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
