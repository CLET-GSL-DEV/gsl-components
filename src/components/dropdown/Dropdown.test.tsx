import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";

const options = [
  { value: "email", label: "Email" },
  { value: "name", label: "Full name" },
];

function ControlledDropdown(
  props: Partial<React.ComponentProps<typeof Dropdown>> & {
    initialValue?: string | null;
  },
) {
  const { initialValue = null, ...rest } = props;
  const [value, setValue] = useState<string | null>(initialValue);

  return (
    <Dropdown
      aria-label="Field"
      value={value}
      onValueChange={setValue}
      options={options}
      {...rest}
    />
  );
}

describe("Dropdown", () => {
  it("renders options and selects a value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Dropdown
        aria-label="Field"
        value={null}
        onValueChange={onValueChange}
        options={options}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Field" }));
    await user.click(screen.getByRole("option", { name: "Email" }));

    expect(onValueChange).toHaveBeenCalledWith("email");
  });

  it("supports clearable selection", async () => {
    const user = userEvent.setup();

    render(<ControlledDropdown clearable initialValue="email" />);

    await user.click(screen.getByRole("combobox", { name: "Field" }));
    await user.click(screen.getByRole("option", { name: "Select..." }));

    expect(screen.getByRole("combobox", { name: "Field" })).toHaveTextContent(
      "Select...",
    );
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();

    render(
      <Dropdown
        aria-label="Field"
        value={null}
        onValueChange={vi.fn()}
        options={options}
        disabled
      />,
    );

    expect(screen.getByRole("combobox", { name: "Field" })).toBeDisabled();
    await user.click(screen.getByRole("combobox", { name: "Field" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders a Lucide chevron icon in the trigger", () => {
    render(
      <Dropdown
        aria-label="Field"
        value={null}
        onValueChange={vi.fn()}
        options={options}
      />,
    );

    const icon = document.querySelector(".clet-dropdown__trigger-icon");
    expect(icon).toBeInTheDocument();
    expect(icon?.querySelector("svg")).toBeInTheDocument();
  });

  it("merges classNames onto parts", () => {
    render(
      <Dropdown
        aria-label="Field"
        value="email"
        onValueChange={vi.fn()}
        options={options}
        classNames={{
          root: "custom-root",
          trigger: "custom-trigger",
          menu: "custom-menu",
          option: "custom-option",
        }}
      />,
    );

    expect(document.querySelector(".clet-dropdown")).toHaveClass("custom-root");
    expect(screen.getByRole("combobox", { name: "Field" })).toHaveClass(
      "custom-trigger",
    );
  });
});
