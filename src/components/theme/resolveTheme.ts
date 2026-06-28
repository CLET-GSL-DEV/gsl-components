export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(theme: "light" | "dark" | "system"): "light" | "dark" {
  if (theme === "system") {
    return getSystemTheme();
  }

  return theme;
}
