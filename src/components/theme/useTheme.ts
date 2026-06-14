import { useContext } from "react";
import type { UseThemeReturn } from "../../types/theme";
import { ThemeContext } from "./ThemeContext";

export function useTheme(): UseThemeReturn {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
