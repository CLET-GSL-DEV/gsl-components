import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RoleSelect } from "./RoleSelect";

const roles = [
  { id: "admin", name: "Admin" },
  { id: "editor", name: "Editor" },
  { id: "viewer", name: "Viewer", disabled: true },
];

describe("RoleSelect", () => {
  it("renders a closed dropdown trigger showing the label and selected role", () => {
    render(
      <RoleSelect
        title="View as"
        roles={roles}
        selectedRole="editor"
        onClickRole={vi.fn()}
      />,
    );

    expect(screen.getByText("View as")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("shows a placeholder when no role is selected", () => {
    render(<RoleSelect roles={roles} onClickRole={vi.fn()} />);

    expect(screen.getByText("Select role")).toBeInTheDocument();
    expect(screen.getByText("View as")).toBeInTheDocument();
  });

  it("opens the popover to reveal all roles with radio state on click", async () => {
    const user = userEvent.setup();
    render(
      <RoleSelect roles={roles} selectedRole="editor" onClickRole={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /View as/ }));

    const menu = screen.getByRole("menu");
    const editorOption = within(menu).getByRole("button", { name: "Editor" });
    const adminOption = within(menu).getByRole("button", { name: "Admin" });
    expect(editorOption).toHaveAttribute("aria-pressed", "true");
    expect(adminOption).toHaveAttribute("aria-pressed", "false");
  });

  it("does not call onClickRole for a disabled role", async () => {
    const user = userEvent.setup();
    const onClickRole = vi.fn();
    render(<RoleSelect roles={roles} onClickRole={onClickRole} noConfirm />);

    await user.click(screen.getByRole("button", { name: /View as/ }));
    const menu = screen.getByRole("menu");
    await user.click(within(menu).getByRole("button", { name: "Viewer" }));

    expect(onClickRole).not.toHaveBeenCalled();
  });

  it("calls onClickRole immediately when noConfirm is set", async () => {
    const user = userEvent.setup();
    const onClickRole = vi.fn();
    render(<RoleSelect roles={roles} onClickRole={onClickRole} noConfirm />);

    await user.click(screen.getByRole("button", { name: /View as/ }));
    const menu = screen.getByRole("menu");
    await user.click(within(menu).getByRole("button", { name: "Admin" }));

    expect(onClickRole).toHaveBeenCalledWith(roles[0]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a confirm dialog before calling onClickRole by default", async () => {
    const user = userEvent.setup();
    const onClickRole = vi.fn();
    render(<RoleSelect roles={roles} onClickRole={onClickRole} />);

    await user.click(screen.getByRole("button", { name: /View as/ }));
    const menu = screen.getByRole("menu");
    await user.click(within(menu).getByRole("button", { name: "Admin" }));

    expect(onClickRole).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Confirm Role Switch" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to switch to the Admin portal?"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Switch" }));

    expect(onClickRole).toHaveBeenCalledWith(roles[0]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not call onClickRole when the confirm dialog is cancelled", async () => {
    const user = userEvent.setup();
    const onClickRole = vi.fn();
    render(<RoleSelect roles={roles} onClickRole={onClickRole} />);

    await user.click(screen.getByRole("button", { name: /View as/ }));
    const menu = screen.getByRole("menu");
    await user.click(within(menu).getByRole("button", { name: "Admin" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClickRole).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
