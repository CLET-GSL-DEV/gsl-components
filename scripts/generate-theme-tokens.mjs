#!/usr/bin/env node
// Scans src/styles/theme/*.css and each component's styles/*.css for --gsl-*
// custom property definitions, then emits src/generated/components.theme.ts —
// the typed surface consumed by gslTheme(). Run via `npm run generate:tokens`.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const themeDir = path.join(root, "src/styles/theme");
const componentsDir = path.join(root, "src/components");
const outFile = path.join(root, "src/generated/components.theme.ts");

function extractDefinedVars(css) {
  const names = new Set();
  for (const m of css.matchAll(/(--gsl-[\w-]+)\s*:\s*[^;]+;/g)) {
    names.add(m[1]);
  }
  return names;
}

function toPascalCase(kebab) {
  return kebab
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join("");
}

function toCamelCase(kebab) {
  return kebab
    .split("-")
    .map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1)))
    .join("");
}

// Value-type classification. Best-effort: catches common mistakes (wrong
// JS type, missing "#", non-numeric length) — not full CSS grammar validation.
function classify(name) {
  const local = name.replace(/^--gsl-/, "");
  if (/radius/.test(local)) return "length";
  if (/shadow/.test(local)) return "shadow";
  if (/^z(-|$)/.test(local)) return "zIndex";
  if (/font/.test(local)) return "font";
  if (/opacity/.test(local)) return "opacity";
  if (/(size|gap|width|height|padding|margin|px$|py$|-px-|-py-)/.test(local))
    return "length";
  if (/(duration|transition|delay|stagger)/.test(local)) return "duration";
  if (
    /(color|^bg$|-bg$|bg-|background|border|accent|track|success|warning|error|primary|surface|hover|overlay|text|focus|current|highlight|shimmer)/.test(
      local,
    )
  )
    return "color";
  return "misc";
}

const VALUE_TYPE_ALIAS = {
  color: "GslColorValue",
  length: "GslLengthValue",
  shadow: "GslShadowValue",
  zIndex: "GslZIndexValue",
  opacity: "GslOpacityValue",
  font: "GslStringValue",
  duration: "GslStringValue",
  misc: "GslStringValue",
};

// `stripPrefix` is what's removed before camelCasing — "--gsl-" for global
// tokens, "--gsl-<component-slug>-" for component tokens (so AppHeader's
// "--gsl-app-header-bg" becomes the key "bg", not "appHeaderBg").
function collect(vars, stripPrefix, scopeLabel) {
  const seen = new Map();
  const entries = [...vars]
    .sort()
    .map((cssVar) => {
      const local = cssVar.slice(stripPrefix.length);
      const camel = toCamelCase(local);
      const prior = seen.get(camel);
      if (prior) {
        throw new Error(
          `generate-theme-tokens: camelCase collision in ${scopeLabel} — "${prior}" and "${cssVar}" both map to "${camel}"`,
        );
      }
      seen.set(camel, cssVar);
      return { camel, cssVar, group: classify(cssVar) };
    });
  return entries;
}

// ── global tokens (src/styles/theme/{base,light,dark}.css) ──
const globalVars = new Set();
for (const file of ["base.css", "light.css", "dark.css"]) {
  const p = path.join(themeDir, file);
  if (!existsSync(p)) continue;
  for (const v of extractDefinedVars(readFileSync(p, "utf8"))) globalVars.add(v);
}
const globalTokens = collect(globalVars, "--gsl-", "global tokens");

// ── component-scoped tokens: only vars prefixed --gsl-<component-slug>- ──
const componentEntries = [];
for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const stylesDir = path.join(componentsDir, entry.name, "styles");
  if (!existsSync(stylesDir)) continue;

  const prefix = `--gsl-${entry.name}-`;
  const vars = new Set();
  for (const file of readdirSync(stylesDir)) {
    if (!file.endsWith(".css")) continue;
    const css = readFileSync(path.join(stylesDir, file), "utf8");
    for (const v of extractDefinedVars(css)) {
      if (v.startsWith(prefix)) vars.add(v);
    }
  }
  if (vars.size === 0) continue;

  const key = toPascalCase(entry.name);
  componentEntries.push({
    key,
    selector: `.gsl-${entry.name}`,
    tokens: collect(vars, prefix, key),
  });
}
componentEntries.sort((a, b) => a.key.localeCompare(b.key));

// ── emit ──
function renderTokenFields(tokens, indent = "  ") {
  return tokens
    .map((t) => `${indent}${t.camel}?: ${VALUE_TYPE_ALIAS[t.group]};`)
    .join("\n");
}

function renderVarMap(tokens, indent = "  ") {
  return tokens
    .map((t) => `${indent}${t.camel}: "${t.cssVar}",`)
    .join("\n");
}

const globalInterface = renderTokenFields(globalTokens);
const globalVarMap = renderVarMap(globalTokens);

const componentInterfaces = componentEntries
  .map(
    (c) =>
      `export interface Gsl${c.key}Tokens {\n${renderTokenFields(c.tokens)}\n}`,
  )
  .join("\n\n");

const componentTokenMapEntries = componentEntries
  .map((c) => `  ${c.key}: Gsl${c.key}Tokens;`)
  .join("\n");

const selectorEntries = componentEntries
  .map((c) => `  ${c.key}: "${c.selector}",`)
  .join("\n");

const componentVarMapEntries = componentEntries
  .map((c) => `  ${c.key}: {\n${renderVarMap(c.tokens, "    ")}\n  },`)
  .join("\n");

const output = `// GENERATED FILE — do not edit by hand.
// Run \`npm run generate:tokens\` to refresh after changing theme or component CSS.

export type GslColorValue =
  | \`#\${string}\`
  | \`rgb(\${string})\`
  | \`rgba(\${string})\`
  | \`hsl(\${string})\`
  | \`hsla(\${string})\`
  | \`oklch(\${string})\`
  | \`var(--\${string})\`;

export type GslLengthValue =
  | \`\${number}px\`
  | \`\${number}rem\`
  | \`\${number}em\`
  | \`\${number}%\`
  | "0"
  | \`var(--\${string})\`;

export type GslZIndexValue = number;

export type GslOpacityValue = number | \`\${number}%\`;

export type GslShadowValue = string;

export type GslStringValue = string;

// Keys are camelCase (e.g. "primary", "radiusBase") — GSL_GLOBAL_TOKEN_VARS
// maps each back to its real CSS custom property (e.g. "--gsl-primary").
export interface GslGlobalTokens {
${globalInterface}
}

${componentInterfaces}

export interface GslComponentTokenMap {
${componentTokenMapEntries}
}

export const GSL_COMPONENT_SELECTORS: Record<keyof GslComponentTokenMap, string> = {
${selectorEntries}
};

export const GSL_GLOBAL_TOKEN_VARS: Record<keyof GslGlobalTokens, string> = {
${globalVarMap}
};

export const GSL_COMPONENT_TOKEN_VARS: {
  [K in keyof GslComponentTokenMap]: Record<keyof GslComponentTokenMap[K], string>;
} = {
${componentVarMapEntries}
};
`;

writeFileSync(outFile, output);
console.log(
  `generate-theme-tokens: ${globalTokens.length} global tokens, ${componentEntries.length} components (${componentEntries.reduce((n, c) => n + c.tokens.length, 0)} component tokens).`,
);
