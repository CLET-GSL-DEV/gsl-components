import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
  it("selects a radio and calls onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioGroup onValueChange={onValueChange}>
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" />
      </RadioGroup>,
    );

    await user.click(screen.getByRole("radio", { name: "SMS" }));

    expect(onValueChange).toHaveBeenCalledWith("sms");
    expect(screen.getByRole("radio", { name: "SMS" })).toBeChecked();
  });

  it("reflects controlled value", () => {
    render(
      <RadioGroup value="email" onValueChange={vi.fn()}>
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" />
      </RadioGroup>,
    );

    expect(screen.getByRole("radio", { name: "Email" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "SMS" })).not.toBeChecked();
  });

  it("does not select a disabled radio item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioGroup onValueChange={onValueChange}>
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" disabled />
      </RadioGroup>,
    );

    const smsRadio = screen.getByRole("radio", { name: "SMS" });
    expect(smsRadio).toBeDisabled();

    await user.click(smsRadio);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables all radios when the group is disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioGroup disabled onValueChange={onValueChange}>
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" />
      </RadioGroup>,
    );

    expect(screen.getByRole("radio", { name: "Email" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "SMS" })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "Email" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("merges classNames onto group and radio parts", () => {
    render(
      <RadioGroup
        value="email"
        onValueChange={vi.fn()}
        classNames={{ root: "custom-group" }}
      >
        <Radio
          value="email"
          label="Email"
          classNames={{
            root: "custom-radio",
            control: "custom-control",
            label: "custom-label",
          }}
        />
      </RadioGroup>,
    );

    expect(document.querySelector(".clet-radio-group")).toHaveClass(
      "custom-group",
    );
    expect(screen.getByRole("radio", { name: "Email" })).toHaveClass(
      "custom-control",
    );
    expect(screen.getByText("Email")).toHaveClass("custom-label");
    expect(document.querySelector(".clet-radio")).toHaveClass("custom-radio");
  });

  it("supports aria-label when no visible label is provided", () => {
    render(
      <RadioGroup value="email" onValueChange={vi.fn()}>
        <Radio value="email" aria-label="Email option" />
      </RadioGroup>,
    );

    expect(
      screen.getByRole("radio", { name: "Email option" }),
    ).toBeInTheDocument();
  });

  it("renders description text for an option", () => {
    render(
      <RadioGroup value="starter" onValueChange={vi.fn()}>
        <Radio
          value="starter"
          label="Starter"
          description="For individuals getting started."
        />
      </RadioGroup>,
    );

    expect(
      screen.getByText("For individuals getting started."),
    ).toBeInTheDocument();
    expect(screen.getByText("For individuals getting started.")).toHaveClass(
      "clet-radio__description",
    );
  });

  it("links description via aria-describedby when present", () => {
    render(
      <RadioGroup value="starter" onValueChange={vi.fn()}>
        <Radio
          value="starter"
          label="Starter"
          description="For individuals getting started."
        />
      </RadioGroup>,
    );

    const radio = screen.getByRole("radio", {
      name: /Starter/,
    });
    const description = screen.getByText("For individuals getting started.");

    expect(radio).toHaveAttribute("aria-describedby", description.id);
  });

  it("applies card variant classes to group and radio", () => {
    render(
      <RadioGroup variant="card" value="starter" onValueChange={vi.fn()}>
        <Radio
          value="starter"
          label="Starter"
          description="For individuals getting started."
        />
      </RadioGroup>,
    );

    expect(document.querySelector(".clet-radio-group")).toHaveClass(
      "clet-radio-group--card",
    );
    expect(document.querySelector(".clet-radio")).toHaveClass("clet-radio--card");
  });

  it("selects card option and calls onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioGroup variant="card" onValueChange={onValueChange}>
        <Radio
          value="starter"
          label="Starter"
          description="For individuals getting started."
        />
        <Radio
          value="team"
          label="Team"
          description="Collaborate with up to 10 members."
        />
      </RadioGroup>,
    );

    await user.click(screen.getByRole("radio", { name: /Team/ }));

    expect(onValueChange).toHaveBeenCalledWith("team");
    expect(screen.getByRole("radio", { name: /Team/ })).toBeChecked();
  });
});

function ControlledRadioGroup() {
  const [value, setValue] = useState("email");

  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <Radio value="email" label="Email" />
      <Radio value="sms" label="SMS" />
    </RadioGroup>
  );
}

describe("RadioGroup controlled interaction", () => {
  it("updates selection when controlled", async () => {
    const user = userEvent.setup();

    render(<ControlledRadioGroup />);

    expect(screen.getByRole("radio", { name: "Email" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "SMS" }));
    expect(screen.getByRole("radio", { name: "SMS" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Email" })).not.toBeChecked();
  });
});
