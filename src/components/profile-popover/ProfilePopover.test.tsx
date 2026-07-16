import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfilePopover } from "./ProfilePopover";
import { RoleSelect } from "../role-select/RoleSelect";
import { ThemeProvider } from "../theme/ThemeProvider";

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

  it("renders default items (My Profile, Account Settings, Help and Support) when items is omitted", async () => {
    const user = userEvent.setup();
    const onMyProfile = vi.fn();
    const onAccountSettings = vi.fn();
    const onHelpAndSupport = vi.fn();
    render(
      <ProfilePopover
        fullName="Yaw Boateng"
        onMyProfile={onMyProfile}
        onAccountSettings={onAccountSettings}
        onHelpAndSupport={onHelpAndSupport}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    const menu = screen.getByRole("menu");

    await user.click(within(menu).getByRole("button", { name: "My Profile" }));
    await user.click(
      within(menu).getByRole("button", { name: "Account Settings" }),
    );
    await user.click(
      within(menu).getByRole("button", { name: "Help and Support" }),
    );
    expect(within(menu).getByRole("button", { name: /Sign Out/ })).toBeInTheDocument();

    expect(onMyProfile).toHaveBeenCalledTimes(1);
    expect(onAccountSettings).toHaveBeenCalledTimes(1);
    expect(onHelpAndSupport).toHaveBeenCalledTimes(1);
  });

  it("replaces the default items entirely when items is passed", async () => {
    const user = userEvent.setup();
    render(
      <ProfilePopover
        fullName="Yaw Boateng"
        items={[{ label: "Custom Row" }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    const menu = screen.getByRole("menu");

    expect(within(menu).getByRole("button", { name: "Custom Row" })).toBeInTheDocument();
    expect(within(menu).queryByRole("button", { name: "My Profile" })).not.toBeInTheDocument();
  });

  it("calls the item and sign out callbacks (confirming the Sign Out dialog)", async () => {
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
    expect(onSignOut).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Confirm Sign Out")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Sign Out" }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("does not call onSignOut when the confirm dialog is cancelled", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();

    render(<ProfilePopover fullName="Yaw Boateng" onSignOut={onSignOut} />);

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    await user.click(
      within(screen.getByRole("menu")).getByRole("button", { name: /Sign Out/ }),
    );

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(onSignOut).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("skips the confirm dialog and signs out immediately when noConfirmSignOut is set", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();

    render(
      <ProfilePopover
        fullName="Yaw Boateng"
        onSignOut={onSignOut}
        noConfirmSignOut
      />,
    );

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    await user.click(
      within(screen.getByRole("menu")).getByRole("button", { name: /Sign Out/ }),
    );

    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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

  it("renders no theme toggle without a ThemeProvider ancestor", async () => {
    const user = userEvent.setup();
    render(<ProfilePopover fullName="Yaw Boateng" />);

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    expect(
      screen.queryByRole("button", { name: /Switch to (dark|light) mode/ }),
    ).not.toBeInTheDocument();
  });

  it("bakes in a theme toggle at the far right of the header row when a ThemeProvider is present", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="light" storageKey="">
        <ProfilePopover fullName="Yaw Boateng" />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Yaw Boateng/ }));
    const toggle = screen.getByRole("button", { name: "Switch to dark mode" });
    await user.click(toggle);
    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();
  });
});

describe("ProfilePopover — user/variant header trigger", () => {
  const user = {
    name: "Kwame",
    role: "Admin",
    initials: "KA",
    email: "kwame@example.com",
  };

  it("renders user name and role in trigger", () => {
    render(<ProfilePopover user={user} />);
    expect(screen.getByText("Kwame")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("forwards ref to the trigger", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ProfilePopover user={user} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("opens the unified profile popover with email", async () => {
    const userEvents = userEvent.setup();
    render(<ProfilePopover user={user} variant="full" />);

    await userEvents.click(screen.getByText("Kwame"));
    const menu = screen.getByRole("menu");
    expect(within(menu).getByText("kwame@example.com")).toBeInTheDocument();
    expect(
      within(menu).getByRole("button", { name: /Sign Out/ }),
    ).toBeInTheDocument();
  });

  it("opens the same popover for the avatar-only variant", async () => {
    const userEvents = userEvent.setup();
    const { container } = render(
      <ProfilePopover user={user} variant="avatar" />,
    );

    const trigger = container.querySelector(".clet-app-header__profile")!;
    await userEvents.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders a custom items array and calls their callbacks", async () => {
    const userEvents = userEvent.setup();
    const onProfileClick = vi.fn();
    const onSignOut = vi.fn();
    render(
      <ProfilePopover
        user={user}
        items={[{ label: "My Profile", onClick: onProfileClick }]}
        onSignOut={onSignOut}
      />,
    );

    await userEvents.click(screen.getByText("Kwame"));
    const menu = screen.getByRole("menu");
    await userEvents.click(
      within(menu).getByRole("button", { name: /My Profile/ }),
    );
    await userEvents.click(
      within(menu).getByRole("button", { name: /Sign Out/ }),
    );

    expect(onProfileClick).toHaveBeenCalledTimes(1);
    expect(onSignOut).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    await userEvents.click(
      within(dialog).getByRole("button", { name: "Sign Out" }),
    );
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("renders extra composable content as children", async () => {
    const userEvents = userEvent.setup();
    render(
      <ProfilePopover user={user}>
        <RoleSelect roles={roles} onClickRole={vi.fn()} />
      </ProfilePopover>,
    );

    await userEvents.click(screen.getByText("Kwame"));
    expect(
      screen.getByRole("button", { name: /View as/ }),
    ).toBeInTheDocument();
  });
});
