import { useCallback, useEffect, useMemo, useState } from "react";
import type { GslTheme, ThemeProviderProps } from "../../types/theme";
import { getSystemTheme, resolveTheme } from "./resolveTheme";
import { ThemeContext } from "./ThemeContext";

export function ThemeProvider({
  theme: controlledTheme,
  defaultTheme = "system",
  onThemeChange,
  className,
  style,
  children,
}: ThemeProviderProps) {
  const [uncontrolledTheme, setUncontrolledTheme] = useState<GslTheme>(defaultTheme);
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

    document.documentElement.setAttribute("data-gsl-theme", resolvedTheme);

    return () => {
      document.documentElement.removeAttribute("data-gsl-theme");
    };
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (nextTheme: GslTheme) => {
      if (isControlled) {
        onThemeChange?.(nextTheme);
        return;
      }

      setUncontrolledTheme(nextTheme);
      onThemeChange?.(nextTheme);
    },
    [isControlled, onThemeChange],
  );

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme],
  );

  const rootClass = ["gsl-theme", className].filter(Boolean).join(" ");

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={rootClass}
        data-gsl-theme={resolvedTheme}
        style={style}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
