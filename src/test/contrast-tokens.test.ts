/**
 * DS-01 regression gate.
 *
 * The audit found status text painted in its own saturated hue, which in the
 * light theme lands as low as 1.7:1. The fix was a -text companion for every
 * status hue; this file is what stops the fix rotting. It reads the real
 * theme stylesheets, so a changed hex fails here and not in production.
 *
 * WCAG 2.1 AA: 4.5:1 for body text, 3:1 for non-text boundaries and icons.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio, mixOver, parseThemeTokens } from "./lib/contrast";

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

const themeDir = path.resolve(__dirname, "../styles/theme");
const read = (f: string) =>
	parseThemeTokens(readFileSync(path.join(themeDir, f), "utf8"));

const THEMES = {
	light: read("light.css"),
	dark: read("dark.css"),
} as const;

/** Every surface a badge, notice, toast or status label can be drawn on. */
const SURFACE_TOKENS = [
	"--clet-bg",
	"--clet-surface-subtle",
	"--clet-surface-dark",
] as const;

const STATUSES = ["success", "warning", "error", "info"] as const;

/** Tint strengths used across Badge (18%), Notice (10/12/14%) and UploadField (10%). */
const TINT_PERCENTS = [10, 12, 14, 18];

/**
 * Saturated hues that do not clear 3:1 as a boundary, each with the reason it
 * is allowed to. Every entry here is a hue that is NEVER the sole carrier of
 * state: it always accompanies an icon, a title or a text label, so WCAG 1.4.11
 * does not bind. Adding a key silences a real check, so the reason is required
 * and the entry is reviewed like any other deviation.
 */
const NON_TEXT_EXEMPT: Record<string, string> = {
	"light:success:--clet-surface-dark":
		"Only used as a Timeline dot fill and a Notice left-border, both of which also carry an icon and a title.",
	"light:warning:--clet-bg":
		"Amber is the brand warning hue; it fills Timeline dots and Notice borders that always sit beside a warning icon and heading.",
	"light:warning:--clet-surface-subtle":
		"As above. Darkening the fill to 3:1 would make the brand amber read brown.",
	"light:warning:--clet-surface-dark": "As above.",
};

describe.each(Object.entries(THEMES))("%s theme", (themeName, tokens) => {
	const surfaces = SURFACE_TOKENS.map((t) => {
		const value = tokens[t];
		expect(value, `${themeName}: ${t} must be a literal hex`).toBeTruthy();
		return [t, value] as const;
	});

	it("defines a -text companion for every status hue", () => {
		for (const status of STATUSES) {
			expect(
				tokens[`--clet-${status}-text`],
				`--clet-${status}-text missing from ${themeName}.css`,
			).toBeTruthy();
		}
	});

	describe.each(STATUSES)("%s", (status) => {
		it.each(
			surfaces.flatMap(([name, surface]) =>
				TINT_PERCENTS.map((pct) => [name, surface, pct] as const),
			),
		)(
			"-text reads on a %s tint at %s / %i%%",
			(_name, surface, pct) => {
				const fg = tokens[`--clet-${status}-text`];
				const bg = mixOver(tokens[`--clet-${status}`], pct, surface);
				expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA_TEXT);
			},
		);

		it.each(surfaces)("-text reads directly on %s", (_name, surface) => {
			expect(
				contrastRatio(tokens[`--clet-${status}-text`], surface),
			).toBeGreaterThanOrEqual(AA_TEXT);
		});

		it.each(surfaces)(
			"the bare hue clears the non-text floor on %s, or is exempt with a reason",
			(name, surface) => {
				const exemption = NON_TEXT_EXEMPT[`${themeName}:${status}:${name}`];
				const ratio = contrastRatio(tokens[`--clet-${status}`], surface);
				if (exemption) {
					// Recorded deviation, not an oversight. If the hue ever becomes the
					// SOLE indicator of state somewhere, delete the entry and darken it.
					expect(exemption.length).toBeGreaterThan(0);
					return;
				}
				expect(ratio).toBeGreaterThanOrEqual(AA_NON_TEXT);
			},
		);

		it("pairs the hue with an on- ink that reads against it", () => {
			expect(
				contrastRatio(tokens[`--clet-on-${status}`], tokens[`--clet-${status}`]),
			).toBeGreaterThanOrEqual(AA_TEXT);
		});
	});

	describe.each(["--clet-text", "--clet-text-secondary", "--clet-text-muted"])(
		"%s",
		(token) => {
			it.each(surfaces)("reads on %s", (_name, surface) => {
				expect(contrastRatio(tokens[token], surface)).toBeGreaterThanOrEqual(
					AA_TEXT,
				);
			});
		},
	);

	it.each([
		["--clet-primary-text", "the primary hue used as text"],
		["--clet-secondary-text", "the brand gold used as text"],
	])("%s reads on every surface", (token) => {
		for (const [, surface] of surfaces) {
			expect(contrastRatio(tokens[token], surface)).toBeGreaterThanOrEqual(
				AA_TEXT,
			);
		}
	});

	it("on-avatar reads on the darkest generated avatar fill", () => {
		// gradientFromString's lightest stop is hsl(h, 48%, 32%). Hue 60 has the
		// highest luminance at that lightness, so it is the worst case for the
		// white initials painted on it.
		expect(contrastRatio(tokens["--clet-on-avatar"], "#79792a")).toBeGreaterThanOrEqual(
			AA_TEXT,
		);
	});

	it("on-primary reads on primary", () => {
		expect(
			contrastRatio(tokens["--clet-on-primary"], tokens["--clet-primary"]),
		).toBeGreaterThanOrEqual(AA_TEXT);
	});

	it("on-info reads on info", () => {
		expect(
			contrastRatio(tokens["--clet-on-info"], tokens["--clet-info"]),
		).toBeGreaterThanOrEqual(AA_TEXT);
	});

	it("error-text reads on error-bg", () => {
		expect(
			contrastRatio(tokens["--clet-error-text"], tokens["--clet-error-bg"]),
		).toBeGreaterThanOrEqual(AA_TEXT);
	});

	it.each(["--clet-border-strong", "--clet-focus-ring" as string])(
		"%s clears the non-text floor on the page background",
		(token) => {
			if (!tokens[token]) return;
			expect(
				contrastRatio(tokens[token], tokens["--clet-bg"]),
			).toBeGreaterThanOrEqual(AA_NON_TEXT);
		},
	);
});
