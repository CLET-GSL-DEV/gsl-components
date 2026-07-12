import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Launchpad } from "./Launchpad";
import { SystemLaunchpadIcon } from "./SystemLaunchpadIcon";
import { RoleSelect } from "../role-select/RoleSelect";
import type { LaunchpadApp } from "../../types/launchpad";

const staticApps: LaunchpadApp[] = [
  {
    id: "mail",
    name: "Mail",
    icon: <SystemLaunchpadIcon name="Mail" />,
    href: "https://mail.example.com",
  },
];

describe("Launchpad", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders static apps when the panel is opened, under the fixed Launch Pad title", async () => {
    const user = userEvent.setup();

    render(<Launchpad apps={staticApps} />);

    await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

    expect(screen.getByText("Launch Pad")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mail/i })).toBeInTheDocument();
  });

  it("calls onAppSelect when a static app is chosen", async () => {
    const user = userEvent.setup();
    const onAppSelect = vi.fn();

    render(<Launchpad apps={staticApps} onAppSelect={onAppSelect} />);

    await user.click(screen.getByRole("button", { name: "Open Launchpad" }));
    await user.click(screen.getByRole("link", { name: /Mail/i }));

    expect(onAppSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "mail", name: "Mail" }),
    );
  });

  it("shows only a spinner (no text label) when loading is true", async () => {
    const user = userEvent.setup();

    render(<Launchpad apps={[]} loading />);

    await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

    expect(document.querySelector(".gsl-launchpad__spinner")).toBeInTheDocument();
    expect(document.querySelector(".gsl-launchpad__loading")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders apps on the shared gradient/overlay tile system, capped at 9", async () => {
    const user = userEvent.setup();
    const apps: LaunchpadApp[] = Array.from({ length: 12 }, (_, i) => ({
      id: `app-${i}`,
      name: `App ${i}`,
      icon: <SystemLaunchpadIcon name={`App ${i}`} />,
    }));

    render(<Launchpad apps={apps} />);

    await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

    expect(document.querySelectorAll(".gsl-launchpad__tile")).toHaveLength(9);
  });

  it("shows an empty message when not loading and apps is empty", async () => {
    const user = userEvent.setup();

    render(<Launchpad apps={[]} />);

    await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

    expect(screen.getByText("No systems available.")).toBeInTheDocument();
  });

  it("opens the expanded Launchpad modal, showing every app uncapped, when See all is clicked", async () => {
    const user = userEvent.setup();
    const apps: LaunchpadApp[] = Array.from({ length: 12 }, (_, i) => ({
      id: `app-${i}`,
      name: `App ${i}`,
      icon: <SystemLaunchpadIcon name={`App ${i}`} />,
    }));

    render(<Launchpad apps={apps} />);

    await user.click(screen.getByRole("button", { name: "Open Launchpad" }));
    await user.click(screen.getByRole("button", { name: "See all" }));

    expect(screen.getByRole("heading", { name: "Launchpad" })).toBeInTheDocument();
    expect(document.querySelectorAll(".gsl-launchpad__expand-grid .gsl-launchpad__tile")).toHaveLength(12);
  });

  it("selecting an app from the expanded modal calls onAppSelect and closes the modal", async () => {
    const user = userEvent.setup();
    const onAppSelect = vi.fn();

    render(<Launchpad apps={staticApps} onAppSelect={onAppSelect} />);

    await user.click(screen.getByRole("button", { name: "Open Launchpad" }));
    await user.click(screen.getByRole("button", { name: "See all" }));
    await user.click(screen.getByRole("link", { name: /Mail/i }));

    expect(onAppSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "mail", name: "Mail" }),
    );
    expect(screen.queryByRole("heading", { name: "Launchpad" })).not.toBeInTheDocument();
  });

  it("renders a role switcher below the grid via children", async () => {
    const user = userEvent.setup();

    render(
      <Launchpad apps={staticApps}>
        <RoleSelect
          title="View as"
          roles={[{ id: "admin", name: "Admin" }]}
          selectedRole="admin"
          onClickRole={() => {}}
        />
      </Launchpad>,
    );

    await user.click(screen.getByRole("button", { name: "Open Launchpad" }));

    expect(screen.getByText("View as")).toBeInTheDocument();
  });
});
