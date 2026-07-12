function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Deterministic hue from a string (0-360). Same string always produces the same hue.
 */
export function stringToHue(str: string): number {
  return hashString(str) % 360;
}

/**
 * Deterministic index into a fixed-size set of `count` items, derived from a
 * string. Same string always produces the same index. Hashed separately from
 * `stringToHue` (a distinguishing suffix is mixed in) so pattern selection
 * doesn't visually correlate 1:1 with hue selection for the same string.
 */
export function patternIndexFromString(str: string, count: number): number {
  return hashString(`${str}::pattern`) % count;
}

/**
 * Subtle pastel gradient from a string — pastel in light mode, richer in dark.
 * Intended for a dark-text-on-light-background pairing (e.g. Avatar initials).
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

/**
 * Deterministic saturated gradient from a string, dark enough in both themes
 * to carry white foreground content (e.g. an icon glyph or initials).
 */
export function vividGradientFromString(str: string, theme?: string): string {
  const hue = stringToHue(str);
  const isDark = theme === "dark";
  const top = `hsl(${hue}, ${isDark ? 40 : 55}%, ${isDark ? 24 : 30}%)`;
  const bottom = `hsl(${(hue + 28) % 360}, ${isDark ? 44 : 58}%, ${isDark ? 32 : 38}%)`;
  return `linear-gradient(135deg, ${top}, ${bottom})`;
}

/**
 * Deterministic index into a fixed-size set of `count` gradients, derived
 * from a string. Same string always produces the same index.
 */
export function gradientIndexFromString(str: string, count: number): number {
  return hashString(str) % count;
}

/**
 * Deterministic index into a fixed-size set of `count` decorative overlays,
 * derived from a string. Hashed separately from `gradientIndexFromString`
 * (a distinguishing suffix is mixed in) so the overlay choice varies
 * independently of the gradient choice for the same string.
 */
export function overlayIndexFromString(str: string, count: number): number {
  return hashString(`${str}::overlay`) % count;
}
