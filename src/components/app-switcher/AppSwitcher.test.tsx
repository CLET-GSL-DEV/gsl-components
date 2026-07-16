import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppSwitcher } from "./AppSwitcher";
import type { AppItem } from "../../types/app-switcher";

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

    expect(screen.getByText("System directory")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mail/i })).toBeInTheDocument();
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
    await user.click(screen.getByRole("link", { name: /Mail/i }));

    expect(onAppSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "mail", name: "Mail" }),
    );
  });

  it("shows a loading state when loading is true", async () => {
    const user = userEvent.setup();

    render(
      <AppSwitcher
        apps={[]}
        loading
        loadingLabel="Loading systems..."
        title="System directory"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open app switcher" }));

    expect(screen.getByText("Loading systems...")).toBeInTheDocument();
    expect(document.querySelector(".clet-app-switcher__spinner")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders round image icons for URL-based app icons", async () => {
    const user = userEvent.setup();

    render(
      <AppSwitcher
        apps={[
          {
            id: "portal",
            name: "Portal",
            icon: "https://example.com/icon.png",
          },
        ]}
        title="System directory"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open app switcher" }));

    const image = document.querySelector(".clet-app-switcher__icon-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/icon.png");
  });

  it("shows an empty message when not loading and apps is empty", async () => {
    const user = userEvent.setup();

    render(<AppSwitcher apps={[]} title="System directory" />);

    await user.click(screen.getByRole("button", { name: "Open app switcher" }));

    expect(screen.getByText("No systems available.")).toBeInTheDocument();
  });
});
