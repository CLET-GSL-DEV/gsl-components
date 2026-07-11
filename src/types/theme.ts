import type { CSSProperties, ReactNode } from "react";
import type { GslComponentTokenMap, GslGlobalTokens } from "../generated/components.theme";

export type GslTheme = "light" | "dark" | "system";

export type ResolvedGslTheme = "light" | "dark";

export interface ThemeProviderProps {
  theme?: GslTheme;
  defaultTheme?: GslTheme;
  onThemeChange?: (theme: GslTheme) => void;
  /** localStorage key for persisting theme across sessions. Omit for no persistence. */
  storageKey?: string;
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

export interface GslComponentThemeOverrides<T> {
  /** Applied to both light and dark, per token — a token here is skipped if that mode sets its own value. */
  all?: T;
  light?: T;
  dark?: T;
}

export type GslComponentThemeConfig = {
  [K in keyof GslComponentTokenMap]?: GslComponentThemeOverrides<GslComponentTokenMap[K]>;
};

export interface GslThemeConfig {
  /** --gsl-* token overrides applied to both light and dark — per token, skipped if that mode sets its own value below. */
  all?: GslGlobalTokens;
  /** --gsl-* token overrides applied under [data-gsl-theme="light"] */
  light?: GslGlobalTokens;
  /** --gsl-* token overrides applied under [data-gsl-theme="dark"] */
  dark?: GslGlobalTokens;
  /** Per-component --gsl-<component>-* token overrides, keyed by component name (e.g. AppHeader, Card). */
  components?: GslComponentThemeConfig;
}
