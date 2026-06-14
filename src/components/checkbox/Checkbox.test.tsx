import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders with a label and toggles on click", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Checkbox
        label="Accept terms"
        onCheckedChange={onCheckedChange}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Checkbox
        label="Accept terms"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("reflects controlled checked state", () => {
    render(
      <Checkbox
        label="Subscribe"
        checked
        onCheckedChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toBeChecked();
  });

  it("merges classNames onto parts", () => {
    render(
      <Checkbox
        label="Custom"
        checked
        onCheckedChange={vi.fn()}
        classNames={{
          root: "custom-root",
          control: "custom-control",
          label: "custom-label",
        }}
      />,
    );

    expect(document.querySelector(".gsl-checkbox")).toHaveClass("custom-root");
    expect(screen.getByRole("checkbox", { name: "Custom" })).toHaveClass(
      "custom-control",
    );
    expect(screen.getByText("Custom")).toHaveClass("custom-label");
  });

  it("supports uncontrolled defaultChecked", async () => {
    const user = userEvent.setup();

    render(<Checkbox label="Remember me" defaultChecked />);

    const checkbox = screen.getByRole("checkbox", { name: "Remember me" });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("supports aria-label when no visible label", () => {
    render(
      <Checkbox
        aria-label="Select row"
        checked={false}
        onCheckedChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: "Select row" }),
    ).toBeInTheDocument();
  });
});

function ControlledCheckbox() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      label="Toggle me"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

describe("Checkbox controlled interaction", () => {
  it("updates checked state when controlled", async () => {
    const user = userEvent.setup();

    render(<ControlledCheckbox />);

    const checkbox = screen.getByRole("checkbox", { name: "Toggle me" });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
