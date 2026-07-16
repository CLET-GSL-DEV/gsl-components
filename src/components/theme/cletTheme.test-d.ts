import { describe, expectTypeOf, it } from "vitest";
import { cletTheme } from "./cletTheme";
import type { CletThemeConfig } from "../../types/theme";

describe("cletTheme types", () => {
  it("accepts a known global token with a valid value", () => {
    cletTheme({ light: { primary: "#1d4ed8" } });
    cletTheme({ light: { primary: "var(--clet-brand)" } });
    cletTheme({ light: { zHeader: 20 } });
    cletTheme({ light: { radiusBase: "8px" } });
  });

  it("rejects an unknown global token key", () => {
    // @ts-expect-error -- "notARealToken" is not a known global token
    cletTheme({ light: { notARealToken: "#000" } });
  });

  it("rejects the raw CSS custom property name — keys are camelCase", () => {
    // @ts-expect-error -- keys are camelCase ("primary"), not the raw "--clet-primary" string
    cletTheme({ light: { "--clet-primary": "#1d4ed8" } });
  });

  it("rejects a value of the wrong shape for a token's group", () => {
    // @ts-expect-error -- color tokens must be a recognized CSS color function/hex/var(), not a bare word
    cletTheme({ light: { primary: "blue" } });
    // @ts-expect-error -- z-index tokens are numbers, not strings
    cletTheme({ light: { zHeader: "20" } });
    // @ts-expect-error -- length tokens need a unit
    cletTheme({ light: { radiusBase: "8" } });
  });

  it("accepts a known component token with a valid value", () => {
    cletTheme({ components: { AppHeader: { light: { bg: "#111827" } } } });
    cletTheme({ components: { Card: { dark: { padding: "24px" } } } });
  });

  it("rejects an unknown component key", () => {
    cletTheme({
      components: {
        // @ts-expect-error -- "NotAComponent" is not in the component token map
        NotAComponent: { light: {} },
      },
    });
  });

  it("rejects a token that belongs to a different component", () => {
    cletTheme({
      components: {
        // @ts-expect-error -- "padding" is Card's token, not AppHeader's
        AppHeader: { light: { padding: "24px" } },
      },
    });
  });

  it("supports 'all' alongside light/dark, at both the global and component level", () => {
    cletTheme({ all: { radiusBase: "12px" }, light: { primary: "#1d4ed8" } });
    cletTheme({ components: { Card: { all: { padding: "16px" }, dark: { padding: "20px" } } } });
  });

  it("keeps light/dark/all/components optional", () => {
    expectTypeOf<CletThemeConfig>().toHaveProperty("light").toEqualTypeOf<CletThemeConfig["light"]>();
    cletTheme({});
  });
});
