import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DropdownMenu } from "./DropdownMenu";

const items = [
  { id: "edit", label: "Edit", onSelect: vi.fn() },
  { id: "docs", label: "Documentation", href: "https://example.com/docs" },
  { id: "delete", label: "Delete", onSelect: vi.fn(), destructive: true },
];

describe("DropdownMenu", () => {
  it("opens menu on trigger click", async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu
        ariaLabel="Actions"
        trigger={<span>More</span>}
        items={items}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));

    expect(screen.getByRole("menu", { name: "Actions" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
  });

  it("calls onSelect and closes by default", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DropdownMenu
        ariaLabel="Actions"
        trigger={<span>More</span>}
        items={[{ id: "edit", label: "Edit", onSelect }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("keeps menu open when closeOnSelect is false", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DropdownMenu
        ariaLabel="Actions"
        closeOnSelect={false}
        trigger={<span>More</span>}
        items={[{ id: "edit", label: "Edit", onSelect }]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(onSelect).toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu
        ariaLabel="Actions"
        trigger={<span>More</span>}
        items={items}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
