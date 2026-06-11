import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";

const options = [
  { value: "email", label: "Email" },
  { value: "full_name", label: "Full name" },
];

function ControlledDropdown({
  initialValue = null,
  clearable = false,
  onChange = vi.fn(),
  open: controlledOpen,
  onOpenChange,
}: {
  initialValue?: string | null;
  clearable?: boolean;
  onChange?: (value: string | null) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [value, setValue] = useState<string | null>(initialValue);
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      ariaLabel="Choose field"
      value={value}
      options={options}
      clearable={clearable}
      open={controlledOpen ?? open}
      onOpenChange={onOpenChange ?? setOpen}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
    />
  );
}

describe("Dropdown", () => {
  it("renders placeholder when no value is selected", () => {
    render(<ControlledDropdown />);

    expect(
      screen.getByRole("combobox", { name: "Choose field" }),
    ).toHaveTextContent("Select...");
  });

  it("opens the list and selects an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ControlledDropdown onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Choose field" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Email" }));

    expect(onChange).toHaveBeenCalledWith("email");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("clears the value when clearable and placeholder option is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ControlledDropdown
        initialValue="email"
        clearable
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Choose field" }));
    await user.click(screen.getByRole("option", { name: "Select..." }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("closes on outside click", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <ControlledDropdown />
        <button type="button">Outside</button>
      </div>,
    );

    await user.click(screen.getByRole("combobox", { name: "Choose field" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();

    render(<ControlledDropdown />);

    await user.click(screen.getByRole("combobox", { name: "Choose field" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports controlled open state", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ControlledDropdown open={true} onOpenChange={onOpenChange} />,
    );

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Email" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
