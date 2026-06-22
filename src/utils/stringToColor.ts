/**
 * Deterministic hue from a string (0-360). Same string always produces the same hue.
 */
export function stringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/**
 * Subtle pastel gradient from a string — pastel in light mode, richer in dark.
 */
export function gradientFromString(str: string, theme?: string): string {
  const hue = stringToHue(str);
  const isDark = theme === "dark";
  const top = isDark
    ? `hsl(${hue}, 42%, 32%)`
    : `hsl(${hue}, 42%, 72%)`;
  const bottom = isDark
    ? `hsl(${(hue + 30) % 360}, 48%, 40%)`
    : `hsl(${(hue + 30) % 360}, 45%, 78%)`;
  return `linear-gradient(135deg, ${top}, ${bottom})`;
}
