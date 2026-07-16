import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("toggles on click and calls onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Switch aria-label="Notifications" onCheckedChange={onCheckedChange} />);

    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("reflects a controlled checked value", () => {
    render(<Switch aria-label="Notifications" checked onCheckedChange={vi.fn()} />);

    expect(screen.getByRole("switch", { name: "Notifications" })).toBeChecked();
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Switch
        aria-label="Notifications"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );

    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).toBeDisabled();

    await user.click(toggle);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("renders a label and toggles when the label is clicked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Switch label="Email alerts" onCheckedChange={onCheckedChange} />);

    expect(screen.getByText("Email alerts")).toBeInTheDocument();
    await user.click(screen.getByText("Email alerts"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("supports label on the left via labelPosition", () => {
    render(<Switch label="Email alerts" labelPosition="left" />);

    const wrapper = screen.getByText("Email alerts").closest(".clet-switch");
    expect(wrapper?.firstElementChild).toHaveClass("clet-switch__label");
  });

  it("reflects data-state on the track", () => {
    render(<Switch aria-label="Notifications" checked onCheckedChange={vi.fn()} />);

    expect(screen.getByRole("switch")).toHaveAttribute("data-state", "checked");
  });

  it("merges classNames onto root, track, thumb, and label", () => {
    render(
      <Switch
        label="Email alerts"
        classNames={{
          root: "custom-root",
          track: "custom-track",
          thumb: "custom-thumb",
          label: "custom-label",
        }}
      />,
    );

    expect(document.querySelector(".clet-switch")).toHaveClass("custom-root");
    expect(screen.getByRole("switch")).toHaveClass("custom-track");
    expect(document.querySelector(".clet-switch__thumb")).toHaveClass(
      "custom-thumb",
    );
    expect(screen.getByText("Email alerts")).toHaveClass("custom-label");
  });
});

function ControlledSwitch() {
  const [checked, setChecked] = useState(false);

  return (
    <Switch
      aria-label="Notifications"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

describe("Switch controlled interaction", () => {
  it("updates when controlled", async () => {
    const user = userEvent.setup();

    render(<ControlledSwitch />);

    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(toggle).toBeChecked();
  });
});
