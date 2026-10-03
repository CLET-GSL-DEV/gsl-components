#!/usr/bin/env node
// Splits the built stylesheet so an app can leave the fonts out:
//   dist/fonts.css       only the @font-face rules, in source order
//   dist/components.css  everything except the @font-face rules
// dist/index.css (exported as ./style.css) is left untouched and still holds both.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const DIST = resolve(fileURLToPath(new URL("..", import.meta.url)), "dist");
const source = resolve(DIST, "index.css");

if (!existsSync(source)) {
	throw new Error(`split-css: ${source} is missing. Run the vite build first.`);
}

const root = postcss.parse(readFileSync(source, "utf8"), { from: source });
const fonts = postcss.root();
const components = root.clone();

root.walkAtRules("font-face", (rule) => {
	fonts.append(rule.clone());
});
components.walkAtRules("font-face", (rule) => {
	rule.remove();
});

const fontCount = fonts.nodes.length;
if (fontCount === 0) {
	throw new Error("split-css: dist/index.css holds no @font-face rules.");
}

writeFileSync(resolve(DIST, "fonts.css"), fonts.toString());
writeFileSync(resolve(DIST, "components.css"), components.toString());
console.log(`split-css: ${fontCount} @font-face rules -> dist/fonts.css, the rest -> dist/components.css`);
