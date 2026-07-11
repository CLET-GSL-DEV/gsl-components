import { afterEach, describe, expect, it, vi } from "vitest";
import { gslTheme } from "./gslTheme";

afterEach(() => {
  vi.unstubAllGlobals();
  document.getElementById("gsl-theme-overrides")?.remove();
});

describe("gslTheme", () => {
  it("injects a single style tag with light/dark selectors", () => {
    gslTheme({
      light: { primary: "#1d4ed8" },
      dark: { primary: "#ef4444" },
    });

    const styleTag = document.getElementById("gsl-theme-overrides");
    expect(styleTag).not.toBeNull();
    expect(styleTag?.tagName).toBe("STYLE");
    expect(styleTag?.textContent).toContain(
      '[data-gsl-theme="light"], .gsl-theme[data-gsl-theme="light"]',
    );
    expect(styleTag?.textContent).toContain(
      '[data-gsl-theme="dark"], .gsl-theme[data-gsl-theme="dark"]',
    );
    expect(styleTag?.textContent).toContain("--gsl-primary: #1d4ed8;");
    expect(styleTag?.textContent).toContain("--gsl-primary: #ef4444;");
  });

  it("reuses the same tag and replaces content on repeat calls", () => {
    gslTheme({ light: { primary: "#1d4ed8" } });
    gslTheme({ light: { primary: "#059669" } });

    const tags = document.querySelectorAll("#gsl-theme-overrides");
    expect(tags).toHaveLength(1);
    expect(tags[0].textContent).toContain("--gsl-primary: #059669;");
    expect(tags[0].textContent).not.toContain("#1d4ed8");
  });

  it("omits declarations for an unset mode", () => {
    gslTheme({ dark: { primary: "#ef4444" } });

    const styleTag = document.getElementById("gsl-theme-overrides");
    expect(styleTag?.textContent).toContain("--gsl-primary: #ef4444;");

    const lightBlock = styleTag?.textContent?.split('.gsl-theme[data-gsl-theme="dark"]')[0];
    expect(lightBlock).not.toContain("--gsl-primary");
  });

  it("injects component-scoped rules under a descendant selector", () => {
    gslTheme({
      components: {
        AppHeader: {
          light: { bg: "#111827" },
          dark: { bg: "#000000" },
        },
        Card: {
          light: { padding: "24px" },
        },
      },
    });

    const css = document.getElementById("gsl-theme-overrides")?.textContent ?? "";
    expect(css).toContain('[data-gsl-theme="light"] .gsl-app-header {');
    expect(css).toContain('[data-gsl-theme="dark"] .gsl-app-header {');
    expect(css).toContain("--gsl-app-header-bg: #111827;");
    expect(css).toContain("--gsl-app-header-bg: #000000;");
    expect(css).toContain('[data-gsl-theme="light"] .gsl-card {');
    expect(css).toContain("--gsl-card-padding: 24px;");
    expect(css).not.toContain('[data-gsl-theme="dark"] .gsl-card {');
  });

  it("skips a component entry with no overrides for either mode", () => {
    gslTheme({ components: { Card: {} } });

    const css = document.getElementById("gsl-theme-overrides")?.textContent ?? "";
    expect(css).not.toContain(".gsl-card");
  });

  it("applies 'all' to both modes when neither sets its own value", () => {
    gslTheme({ all: { radiusBase: "12px" } });

    const css = document.getElementById("gsl-theme-overrides")?.textContent ?? "";
    const [lightBlock, darkBlock] = css.split('.gsl-theme[data-gsl-theme="dark"]');
    expect(lightBlock).toContain("--gsl-radius-base: 12px;");
    expect(darkBlock).toContain("--gsl-radius-base: 12px;");
  });

  it("lets a mode-specific value win over 'all' for the same token", () => {
    gslTheme({
      all: { primary: "#000000" },
      light: { primary: "#1d4ed8" },
    });

    const css = document.getElementById("gsl-theme-overrides")?.textContent ?? "";
    const [lightBlock, darkBlock] = css.split('.gsl-theme[data-gsl-theme="dark"]');
    expect(lightBlock).toContain("--gsl-primary: #1d4ed8;");
    expect(lightBlock).not.toContain("#000000");
    expect(darkBlock).toContain("--gsl-primary: #000000;");
  });

  it("supports 'all' on component overrides too", () => {
    gslTheme({
      components: {
        Card: {
          all: { padding: "16px" },
          dark: { padding: "20px" },
        },
      },
    });

    const css = document.getElementById("gsl-theme-overrides")?.textContent ?? "";
    const [lightBlock, darkBlock] = css.split('[data-gsl-theme="dark"] .gsl-card');
    expect(lightBlock).toContain("--gsl-card-padding: 16px;");
    expect(darkBlock).toContain("--gsl-card-padding: 20px;");
  });

  it("is a no-op when document is unavailable (SSR)", () => {
    vi.stubGlobal("document", undefined);

    expect(() => gslTheme({ light: { primary: "#1d4ed8" } })).not.toThrow();
  });

  it("ignores an unknown component key rather than crashing", () => {
    expect(() =>
      gslTheme({
        // @ts-expect-error -- deliberately an invalid component name to exercise the runtime guard
        components: { NotAComponent: { light: { foo: "bar" } } },
      }),
    ).not.toThrow();

    const css = document.getElementById("gsl-theme-overrides")?.textContent ?? "";
    expect(css).toBe("");
  });
});
