/**
 * WCAG 2.1 relative-luminance and contrast maths, plus just enough CSS parsing
 * to resolve this library's theme tokens and its color-mix() tints.
 *
 * Used by contrast-tokens.test.ts, which is the regression gate for DS-01: a
 * designer nudging a hex in light.css or dark.css fails the build rather than
 * shipping unreadable text.
 */

export type Rgb = { r: number; g: number; b: number };

export function parseHex(input: string): Rgb {
	const hex = input.trim().replace(/^#/, "");
	const full =
		hex.length === 3 || hex.length === 4
			? hex
					.slice(0, 3)
					.split("")
					.map((c) => c + c)
					.join("")
			: hex.slice(0, 6);
	if (!/^[0-9a-fA-F]{6}$/.test(full)) {
		throw new Error(`Not a hex colour: ${input}`);
	}
	return {
		r: parseInt(full.slice(0, 2), 16),
		g: parseInt(full.slice(2, 4), 16),
		b: parseInt(full.slice(4, 6), 16),
	};
}

export function relativeLuminance({ r, g, b }: Rgb): number {
	const channel = (v: number) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return (
		0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
	);
}

/** WCAG 2.1 contrast ratio, 1 to 21, rounded to two places. */
export function contrastRatio(a: string, b: string): number {
	const la = relativeLuminance(parseHex(a));
	const lb = relativeLuminance(parseHex(b));
	const [hi, lo] = la > lb ? [la, lb] : [lb, la];
	return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/** The opaque result of `color-mix(in srgb, <fg> <pct>%, transparent)` composited over `over`. */
export function mixOver(fg: string, pct: number, over: string): string {
	const a = parseHex(fg);
	const b = parseHex(over);
	const at = pct / 100;
	const ch = (x: number, y: number) =>
		Math.round(x * at + y * (1 - at))
			.toString(16)
			.padStart(2, "0");
	return `#${ch(a.r, b.r)}${ch(a.g, b.g)}${ch(a.b, b.b)}`;
}

/**
 * Reads every `--clet-*: <hex>;` declaration out of a theme stylesheet.
 * Non-hex values (var() chains, rgb(), color-mix()) are skipped: this is a
 * palette reader, not a CSS engine, and only literal hexes are contrast-checked.
 */
export function parseThemeTokens(css: string): Record<string, string> {
	const tokens: Record<string, string> = {};
	for (const m of css.matchAll(/(--clet-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
		tokens[m[1]] = m[2];
	}
	return tokens;
}
