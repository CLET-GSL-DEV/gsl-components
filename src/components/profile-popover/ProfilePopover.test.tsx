import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfilePopover } from "./ProfilePopover";
import { RoleSelect } from "../role-select/RoleSelect";

const roles = [
  { id: "admin", name: "Admin" },
  { id: "editor", name: "Editor" },
];

describe("ProfilePopover", () => {
  it("renders a default trigger with the full name and email", () => {
    render(<ProfilePopover fullName="Yaw Boateng" email="y.boateng@clet.gov.gh" />);

    expect(screen.getByRole("button", { name: /Yaw Boateng/ })).toBeInTheDocument();
    expect(screen.getByText("y.boateng@clet.gov.gh")).toBeInTheDocument();
  });

  it("renders a custom trigger when provided", () => {
    render(
      <ProfilePopover
        fullName="Yaw Boateng"
        trigger={<button type="button">Open menu</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("opens the popover with header, email, dynamic items, and Sign Out", async () => {
    const user = userEvent.setup();
    render(
      <ProfilePopover
        fullName="Yaw Boateng"
        email="y.boateng@clet.gov.gh"
        items={[
          { label: "My Profile" },
          { label: "Account Settings" },
        ]}
      />,
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));

    const menu = screen.getByRole("menu");
    expect(within(menu).getByText("y.boateng@clet.gov.gh")).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: "My Profile" })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: "Account Settings" })).toBeInTheDocument();
    expect(within(menu).getByRole("button", { name: /Sign Out/ })).toBeInTheDocument();
  });

  it("renders no items section when items is omitted", async () => {
    const user = userEvent.setup();
    render(<ProfilePopover fullName="Yaw Boateng" />);

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    const menu = screen.getByRole("menu");

    expect(within(menu).getByRole("button", { name: /Sign Out/ })).toBeInTheDocument();
  });

  it("calls the item and sign out callbacks", async () => {
    const user = userEvent.setup();
    const onProfileClick = vi.fn();
    const onSignOut = vi.fn();

    render(
      <ProfilePopover
        fullName="Yaw Boateng"
        items={[{ label: "My Profile", onClick: onProfileClick }]}
        onSignOut={onSignOut}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    const menu = screen.getByRole("menu");

    await user.click(within(menu).getByRole("button", { name: "My Profile" }));
    await user.click(within(menu).getByRole("button", { name: /Sign Out/ }));

    expect(onProfileClick).toHaveBeenCalledTimes(1);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("renders a headerAction at the far right of the header row", async () => {
    const user = userEvent.setup();
    render(
      <ProfilePopover
        fullName="Yaw Boateng"
        headerAction={<button type="button">Toggle theme</button>}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    const menu = screen.getByRole("menu");

    expect(within(menu).getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("renders a RoleSelect child between items and Sign Out", async () => {
    const user = userEvent.setup();
    render(
      <ProfilePopover fullName="Yaw Boateng">
        <RoleSelect roles={roles} onClickRole={vi.fn()} />
      </ProfilePopover>,
    );

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    const menu = screen.getByRole("menu");

    expect(within(menu).getByRole("button", { name: /View as/ })).toBeInTheDocument();
  });
});
