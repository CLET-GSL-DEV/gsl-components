import type { CSSProperties, ReactNode } from "react";
import type { CletComponentTokenMap, CletGlobalTokens } from "../generated/components.theme";

export type CletTheme = "light" | "dark" | "system";

export type ResolvedCletTheme = "light" | "dark";

export interface ThemeProviderProps {
  theme?: CletTheme;
  defaultTheme?: CletTheme;
  onThemeChange?: (theme: CletTheme) => void;
  /** localStorage key for persisting theme across sessions. Omit for no persistence. */
  storageKey?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface ThemeContextValue {
  theme: CletTheme;
  setTheme: (theme: CletTheme) => void;
  resolvedTheme: ResolvedCletTheme;
}

export type UseThemeReturn = ThemeContextValue;

export interface CletComponentThemeOverrides<T> {
  /** Applied to both light and dark, per token — a token here is skipped if that mode sets its own value. */
  all?: T;
  light?: T;
  dark?: T;
}

export type CletComponentThemeConfig = {
  [K in keyof CletComponentTokenMap]?: CletComponentThemeOverrides<CletComponentTokenMap[K]>;
};

export interface CletThemeConfig {
  /** --clet-* token overrides applied to both light and dark — per token, skipped if that mode sets its own value below. */
  all?: CletGlobalTokens;
  /** --clet-* token overrides applied under [data-clet-theme="light"] */
  light?: CletGlobalTokens;
  /** --clet-* token overrides applied under [data-clet-theme="dark"] */
  dark?: CletGlobalTokens;
  /** Per-component --clet-<component>-* token overrides, keyed by component name (e.g. AppHeader, Card). */
  components?: CletComponentThemeConfig;
}
