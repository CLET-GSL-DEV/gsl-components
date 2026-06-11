import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { FieldMappingSelect } from "./FieldMappingSelect";

const options = [
  { value: "email", label: "Email" },
  { value: "full_name", label: "Full name" },
];

function ControlledFieldMappingSelect({
  initialValue = null,
  onChange = vi.fn(),
}: {
  initialValue?: string | null;
  onChange?: (value: string | null) => void;
}) {
  const [value, setValue] = useState<string | null>(initialValue);
  const [open, setOpen] = useState(false);

  return (
    <FieldMappingSelect
      ariaLabel="Map column"
      value={value}
      options={options}
      open={open}
      onOpenChange={setOpen}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
    />
  );
}

describe("FieldMappingSelect", () => {
  it("renders placeholder when no value is selected", () => {
    render(<ControlledFieldMappingSelect />);

    expect(
      screen.getByRole("combobox", { name: "Map column" }),
    ).toHaveTextContent("Select column...");
  });

  it("opens the list and selects an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ControlledFieldMappingSelect onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Map column" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Email" }));

    expect(onChange).toHaveBeenCalledWith("email");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("clears the value when the placeholder option is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ControlledFieldMappingSelect initialValue="email" onChange={onChange} />,
    );

    await user.click(screen.getByRole("combobox", { name: "Map column" }));
    await user.click(screen.getByRole("option", { name: "Select column..." }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
