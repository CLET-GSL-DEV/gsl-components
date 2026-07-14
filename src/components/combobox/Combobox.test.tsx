import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";
import type { ComboboxOption } from "../../types/combobox";

const options: ComboboxOption[] = [
  { value: "one", label: "Option One" },
  { value: "two", label: "Option Two" },
  { value: "three", label: "Option Three", disabled: true },
];

describe("Combobox (single select)", () => {
  it("opens on trigger click and lists all options", async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        aria-label="Field"
        options={options}
        value={null}
        onValueChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Field" }));

    expect(screen.getByRole("option", { name: "Option One" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Option Two" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Option Three" })).toBeInTheDocument();
  });

  it("selects an option and calls onValueChange, then closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Combobox
        aria-label="Field"
        options={options}
        value={null}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Field" }));
    await user.click(screen.getByRole("option", { name: "Option One" }));

    expect(onValueChange).toHaveBeenCalledWith("one");
    expect(screen.queryByRole("option", { name: "Option One" })).not.toBeInTheDocument();
  });

  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Combobox
        aria-label="Field"
        options={options}
        value={null}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Field" }));
    await user.click(screen.getByRole("option", { name: "Option Three" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("filters options by typing (matches label via keywords)", async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        aria-label="Field"
        options={options}
        value={null}
        onValueChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Field" }));
    await user.type(screen.getByPlaceholderText("Search..."), "Two");

    expect(screen.getByRole("option", { name: "Option Two" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Option One" })).not.toBeInTheDocument();
  });

  it("shows the selected option's label on the trigger", () => {
    render(
      <Combobox
        aria-label="Field"
        options={options}
        value="two"
        onValueChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Field" })).toHaveTextContent(
      "Option Two",
    );
  });

  it("clears the selection via the clear control when clearable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Combobox
        aria-label="Field"
        options={options}
        value="one"
        onValueChange={onValueChange}
        clearable
      />,
    );

    await user.click(screen.getByLabelText("Clear selection"));

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("renders a leading icon per option", async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        aria-label="Field"
        options={[
          { value: "one", label: "Option One", icon: <span data-testid="star" /> },
        ]}
        value={null}
        onValueChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Field" }));

    expect(screen.getByTestId("star")).toBeInTheDocument();
  });
});

function ControlledMultiCombobox() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <Combobox
      aria-label="Field"
      options={options}
      value={value}
      onValueChange={setValue}
      multiple
    />
  );
}

describe("Combobox (multi-select)", () => {
  it("toggles membership, stays open, and shows the selected count", async () => {
    const user = userEvent.setup();

    render(<ControlledMultiCombobox />);

    const trigger = screen.getByRole("button", { name: "Field" });

    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "Option One" }));

    expect(screen.getByRole("option", { name: "Option Two" })).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Selected: 1 option");

    await user.click(screen.getByRole("option", { name: "Option Two" }));

    expect(trigger).toHaveTextContent("Selected: 2 options");

    await user.click(screen.getByRole("option", { name: "Option One" }));

    expect(trigger).toHaveTextContent("Selected: 1 option");
  });
});
