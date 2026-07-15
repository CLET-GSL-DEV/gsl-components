import { afterEach, describe, expect, it, vi } from "vitest";
import { cletTheme } from "./cletTheme";

afterEach(() => {
  vi.unstubAllGlobals();
  document.getElementById("clet-theme-overrides")?.remove();
});

describe("cletTheme", () => {
  it("injects a single style tag with light/dark selectors", () => {
    cletTheme({
      light: { primary: "#1d4ed8" },
      dark: { primary: "#ef4444" },
    });

    const styleTag = document.getElementById("clet-theme-overrides");
    expect(styleTag).not.toBeNull();
    expect(styleTag?.tagName).toBe("STYLE");
    expect(styleTag?.textContent).toContain(
      '[data-clet-theme="light"], .clet-theme[data-clet-theme="light"]',
    );
    expect(styleTag?.textContent).toContain(
      '[data-clet-theme="dark"], .clet-theme[data-clet-theme="dark"]',
    );
    expect(styleTag?.textContent).toContain("--clet-primary: #1d4ed8;");
    expect(styleTag?.textContent).toContain("--clet-primary: #ef4444;");
  });

  it("reuses the same tag and replaces content on repeat calls", () => {
    cletTheme({ light: { primary: "#1d4ed8" } });
    cletTheme({ light: { primary: "#059669" } });

    const tags = document.querySelectorAll("#clet-theme-overrides");
    expect(tags).toHaveLength(1);
    expect(tags[0].textContent).toContain("--clet-primary: #059669;");
    expect(tags[0].textContent).not.toContain("#1d4ed8");
  });

  it("omits declarations for an unset mode", () => {
    cletTheme({ dark: { primary: "#ef4444" } });

    const styleTag = document.getElementById("clet-theme-overrides");
    expect(styleTag?.textContent).toContain("--clet-primary: #ef4444;");

    const lightBlock = styleTag?.textContent?.split('.clet-theme[data-clet-theme="dark"]')[0];
    expect(lightBlock).not.toContain("--clet-primary");
  });

  it("injects component-scoped rules under a descendant selector", () => {
    cletTheme({
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

    const css = document.getElementById("clet-theme-overrides")?.textContent ?? "";
    expect(css).toContain('[data-clet-theme="light"] .clet-app-header {');
    expect(css).toContain('[data-clet-theme="dark"] .clet-app-header {');
    expect(css).toContain("--clet-app-header-bg: #111827;");
    expect(css).toContain("--clet-app-header-bg: #000000;");
    expect(css).toContain('[data-clet-theme="light"] .clet-card {');
    expect(css).toContain("--clet-card-padding: 24px;");
    expect(css).not.toContain('[data-clet-theme="dark"] .clet-card {');
  });

  it("skips a component entry with no overrides for either mode", () => {
    cletTheme({ components: { Card: {} } });

    const css = document.getElementById("clet-theme-overrides")?.textContent ?? "";
    expect(css).not.toContain(".clet-card");
  });

  it("applies 'all' to both modes when neither sets its own value", () => {
    cletTheme({ all: { radiusBase: "12px" } });

    const css = document.getElementById("clet-theme-overrides")?.textContent ?? "";
    const [lightBlock, darkBlock] = css.split('.clet-theme[data-clet-theme="dark"]');
    expect(lightBlock).toContain("--clet-radius-base: 12px;");
    expect(darkBlock).toContain("--clet-radius-base: 12px;");
  });

  it("lets a mode-specific value win over 'all' for the same token", () => {
    cletTheme({
      all: { primary: "#000000" },
      light: { primary: "#1d4ed8" },
    });

    const css = document.getElementById("clet-theme-overrides")?.textContent ?? "";
    const [lightBlock, darkBlock] = css.split('.clet-theme[data-clet-theme="dark"]');
    expect(lightBlock).toContain("--clet-primary: #1d4ed8;");
    expect(lightBlock).not.toContain("#000000");
    expect(darkBlock).toContain("--clet-primary: #000000;");
  });

  it("supports 'all' on component overrides too", () => {
    cletTheme({
      components: {
        Card: {
          all: { padding: "16px" },
          dark: { padding: "20px" },
        },
      },
    });

    const css = document.getElementById("clet-theme-overrides")?.textContent ?? "";
    const [lightBlock, darkBlock] = css.split('[data-clet-theme="dark"] .clet-card');
    expect(lightBlock).toContain("--clet-card-padding: 16px;");
    expect(darkBlock).toContain("--clet-card-padding: 20px;");
  });

  it("is a no-op when document is unavailable (SSR)", () => {
    vi.stubGlobal("document", undefined);

    expect(() => cletTheme({ light: { primary: "#1d4ed8" } })).not.toThrow();
  });

  it("ignores an unknown component key rather than crashing", () => {
    expect(() =>
      cletTheme({
        // @ts-expect-error -- deliberately an invalid component name to exercise the runtime guard
        components: { NotAComponent: { light: { foo: "bar" } } },
      }),
    ).not.toThrow();

    const css = document.getElementById("clet-theme-overrides")?.textContent ?? "";
    expect(css).toBe("");
  });
});
