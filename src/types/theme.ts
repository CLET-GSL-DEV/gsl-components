import type { CSSProperties, ReactNode } from "react";

export type GslTheme = "light" | "dark" | "system";

export type ResolvedGslTheme = "light" | "dark";

export interface ThemeProviderProps {
  theme?: GslTheme;
  defaultTheme?: GslTheme;
  onThemeChange?: (theme: GslTheme) => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface ThemeContextValue {
  theme: GslTheme;
  setTheme: (theme: GslTheme) => void;
  resolvedTheme: ResolvedGslTheme;
}

export type UseThemeReturn = ThemeContextValue;
