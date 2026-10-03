import { createContext } from "react";
import type { ThemeContextValue } from "../../types/theme";

export const ThemeContext = /* @__PURE__ */ createContext<ThemeContextValue | null>(null);
