import { describe, expectTypeOf, it } from "vitest";
import { gslTheme } from "./gslTheme";
import type { GslThemeConfig } from "../../types/theme";

describe("gslTheme types", () => {
  it("accepts a known global token with a valid value", () => {
    gslTheme({ light: { primary: "#1d4ed8" } });
    gslTheme({ light: { primary: "var(--gsl-brand)" } });
    gslTheme({ light: { zHeader: 20 } });
    gslTheme({ light: { radiusBase: "8px" } });
  });

  it("rejects an unknown global token key", () => {
    // @ts-expect-error -- "notARealToken" is not a known global token
    gslTheme({ light: { notARealToken: "#000" } });
  });

  it("rejects the raw CSS custom property name — keys are camelCase", () => {
    // @ts-expect-error -- keys are camelCase ("primary"), not the raw "--gsl-primary" string
    gslTheme({ light: { "--gsl-primary": "#1d4ed8" } });
  });

  it("rejects a value of the wrong shape for a token's group", () => {
    // @ts-expect-error -- color tokens must be a recognized CSS color function/hex/var(), not a bare word
    gslTheme({ light: { primary: "blue" } });
    // @ts-expect-error -- z-index tokens are numbers, not strings
    gslTheme({ light: { zHeader: "20" } });
    // @ts-expect-error -- length tokens need a unit
    gslTheme({ light: { radiusBase: "8" } });
  });

  it("accepts a known component token with a valid value", () => {
    gslTheme({ components: { AppHeader: { light: { bg: "#111827" } } } });
    gslTheme({ components: { Card: { dark: { padding: "24px" } } } });
  });

  it("rejects an unknown component key", () => {
    gslTheme({
      components: {
        // @ts-expect-error -- "NotAComponent" is not in the component token map
        NotAComponent: { light: {} },
      },
    });
  });

  it("rejects a token that belongs to a different component", () => {
    gslTheme({
      components: {
        // @ts-expect-error -- "padding" is Card's token, not AppHeader's
        AppHeader: { light: { padding: "24px" } },
      },
    });
  });

  it("supports 'all' alongside light/dark, at both the global and component level", () => {
    gslTheme({ all: { radiusBase: "12px" }, light: { primary: "#1d4ed8" } });
    gslTheme({ components: { Card: { all: { padding: "16px" }, dark: { padding: "20px" } } } });
  });

  it("keeps light/dark/all/components optional", () => {
    expectTypeOf<GslThemeConfig>().toHaveProperty("light").toEqualTypeOf<GslThemeConfig["light"]>();
    gslTheme({});
  });
});
