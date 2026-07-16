import {
  CLET_COMPONENT_SELECTORS,
  CLET_COMPONENT_TOKEN_VARS,
  CLET_GLOBAL_TOKEN_VARS,
} from "../../generated/components.theme";
import type { CletThemeConfig } from "../../types/theme";

const STYLE_TAG_ID = "clet-theme-overrides";

type TokenValues = Record<string, string | number | undefined>;
type VarMap = Record<string, string>;

function toDeclarations(vars: TokenValues, varMap: VarMap): string {
  return Object.entries(vars)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined && entry[0] in varMap)
    .map(([key, value]) => `  ${varMap[key]}: ${value};`)
    .join("\n");
}

function globalRule(selector: string, vars: TokenValues | undefined, varMap: VarMap): string {
  if (!vars || Object.keys(vars).length === 0) return "";
  return `${selector} {\n${toDeclarations(vars, varMap)}\n}`;
}

function componentRule(
  mode: "light" | "dark",
  selector: string,
  vars: TokenValues | undefined,
  varMap: VarMap,
): string {
  if (!vars || Object.keys(vars).length === 0) return "";
  return `[data-clet-theme="${mode}"] ${selector} {\n${toDeclarations(vars, varMap)}\n}`;
}

// Merges "all" underneath a mode's own overrides, per token — a token set
// in both is won by the mode-specific value.
function withDefaults(all: TokenValues | undefined, mode: TokenValues | undefined): TokenValues | undefined {
  if (!all && !mode) return undefined;
  return { ...all, ...mode };
}

/**
 * Injects a <style> tag overriding --clet-* tokens for light/dark mode,
 * globally and/or per component. Selectors are matched to the specificity
 * the library's own CSS uses for that token, so the override wins via
 * source order (this tag is appended after the library stylesheet)
 * rather than needing !important. Keys are camelCase (e.g. "primary",
 * "radiusBase") and are translated to their real --clet-* custom property.
 */
export function cletTheme(config: CletThemeConfig): void {
  if (typeof document === "undefined") return;

  const all = config.all as TokenValues | undefined;

  const rules = [
    globalRule(
      ':root[data-clet-theme="light"], .clet-theme[data-clet-theme="light"]',
      withDefaults(all, config.light as TokenValues | undefined),
      CLET_GLOBAL_TOKEN_VARS,
    ),
    globalRule(
      ':root[data-clet-theme="dark"], .clet-theme[data-clet-theme="dark"]',
      withDefaults(all, config.dark as TokenValues | undefined),
      CLET_GLOBAL_TOKEN_VARS,
    ),
  ];

  for (const [component, overrides] of Object.entries(config.components ?? {})) {
    const selector = CLET_COMPONENT_SELECTORS[component as keyof typeof CLET_COMPONENT_SELECTORS];
    const varMap = CLET_COMPONENT_TOKEN_VARS[component as keyof typeof CLET_COMPONENT_TOKEN_VARS];
    if (!selector || !varMap || !overrides) continue;
    const componentAll = overrides.all as TokenValues | undefined;
    rules.push(
      componentRule(
        "light",
        selector,
        withDefaults(componentAll, overrides.light as TokenValues | undefined),
        varMap,
      ),
    );
    rules.push(
      componentRule(
        "dark",
        selector,
        withDefaults(componentAll, overrides.dark as TokenValues | undefined),
        varMap,
      ),
    );
  }

  const css = rules.filter(Boolean).join("\n\n");

  let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = STYLE_TAG_ID;
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = css;
}
