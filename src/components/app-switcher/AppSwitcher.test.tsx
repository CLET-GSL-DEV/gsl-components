import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppSwitcher } from "./AppSwitcher";
import type { AppItem } from "../../types/app-switcher";
import { sampleMeAppsResponse } from "../../test/fixtures";

const staticApps: AppItem[] = [
  {
    id: "mail",
    name: "Mail",
    icon: "📧",
    href: "https://mail.example.com",
  },
];

describe("AppSwitcher", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders static apps when the panel is opened", async () => {
    const user = userEvent.setup();

    render(<AppSwitcher apps={staticApps} title="System directory" />);

    await user.click(screen.getByRole("button", { name: "Open app switcher" }));

    expect(screen.getByRole("menu", { name: "System directory" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Mail/i })).toBeInTheDocument();
  });

  it("calls onAppSelect when a static app is chosen", async () => {
    const user = userEvent.setup();
    const onAppSelect = vi.fn();

    render(
      <AppSwitcher
        apps={staticApps}
        title="System directory"
        onAppSelect={onAppSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open app switcher" }));
    await user.click(screen.getByRole("menuitem", { name: /Mail/i }));

    expect(onAppSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "mail", name: "Mail" }),
    );
  });

  it("shows a loading state while remote apps are fetched", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>(() => {
            /* never resolves */
          }),
      ),
    );

    render(
      <AppSwitcher
        baseUrl="https://api.example.com"
        accessToken="secret-token"
        title="System directory"
      />,
    );

    await userEvent.setup().click(
      screen.getByRole("button", { name: "Open app switcher" }),
    );

    expect(screen.getByText("Loading systems...")).toBeInTheDocument();
  });

  it("shows fetched apps after a successful API response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleMeAppsResponse,
      }),
    );

    render(
      <AppSwitcher
        baseUrl="https://api.example.com"
        accessToken="secret-token"
        title="System directory"
      />,
    );

    await userEvent.setup().click(
      screen.getByRole("button", { name: "Open app switcher" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /Governance Portal/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows an error message when the API request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      }),
    );

    render(
      <AppSwitcher
        baseUrl="https://api.example.com"
        accessToken="secret-token"
        title="System directory"
      />,
    );

    await userEvent.setup().click(
      screen.getByRole("button", { name: "Open app switcher" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load apps (403)")).toBeInTheDocument();
    });
  });
});
