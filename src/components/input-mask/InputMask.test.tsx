import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { INPUT_MASK_PRESETS } from "./presets";
import { InputMask } from "./InputMask";
import { applyMask, stripMask } from "./utils/maskUtils";

const phoneMask = "(###) ###-####";
const phoneGhMask = INPUT_MASK_PRESETS.phoneGh;
const phoneIntlGhMask = INPUT_MASK_PRESETS.phoneIntlGh;
const dateMask = INPUT_MASK_PRESETS.date;

function ControlledInputMask({
  initialValue = "",
  mask = phoneMask,
  ariaLabel = "Phone number",
  onChange = vi.fn(),
  onValueChange = vi.fn(),
  disabled = false,
}: {
  initialValue?: string;
  mask?: string;
  ariaLabel?: string;
  onChange?: (masked: string) => void;
  onValueChange?: (unmasked: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <InputMask
      ariaLabel={ariaLabel}
      mask={mask}
      value={value}
      disabled={disabled}
      onChange={(masked) => {
        setValue(masked);
        onChange(masked);
      }}
      onValueChange={onValueChange}
    />
  );
}

describe("maskUtils", () => {
  it("applies phone mask with literals", () => {
    expect(applyMask("1234567890", phoneMask)).toBe("(123) 456-7890");
  });

  it("strips mask to raw value", () => {
    expect(stripMask("(123) 456-7890", phoneMask)).toBe("1234567890");
  });

  it("applies Ghana phone preset without duplicating leading zero", () => {
    expect(applyMask("0", phoneGhMask)).toBe("0");
    expect(applyMask("0241234567", phoneGhMask)).toBe("024 123 4567");
    expect(applyMask("241234567", phoneGhMask)).toBe("024 123 4567");
  });

  it("applies international Ghana phone preset", () => {
    expect(applyMask("+233241234567", phoneIntlGhMask)).toBe("+233 24 123 4567");
  });

  it("applies date preset", () => {
    expect(applyMask("15061990", dateMask)).toBe("15/06/1990");
  });
});

describe("InputMask", () => {
  it("renders with aria label", () => {
    render(<ControlledInputMask />);

    expect(screen.getByRole("textbox", { name: "Phone number" })).toBeInTheDocument();
  });

  it("formats digits as the user types", async () => {
    const user = userEvent.setup();
    render(<ControlledInputMask />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.type(input, "1234567890");

    expect(input).toHaveValue("(123) 456-7890");
  });

  it("calls onValueChange with unmasked digits", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledInputMask onValueChange={onValueChange} />);

    await user.type(screen.getByRole("textbox", { name: "Phone number" }), "123");

    expect(onValueChange).toHaveBeenLastCalledWith("123");
  });

  it("removes the last slot character on backspace", async () => {
    const user = userEvent.setup();
    render(<ControlledInputMask initialValue="(123) 456-7890" />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.click(input);
    await user.keyboard("{End}{Backspace}");

    expect(input).toHaveValue("(123) 456-789");
  });

  it("applies pasted digits through the mask", async () => {
    const user = userEvent.setup();
    render(<ControlledInputMask />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.click(input);
    await user.paste("1234567890");

    expect(input).toHaveValue("(123) 456-7890");
  });

  it("does not accept input when disabled", async () => {
    const user = userEvent.setup();
    render(<ControlledInputMask disabled />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.type(input, "123");

    expect(input).toHaveValue("");
  });

  it("formats Ghana phone preset as the user types", async () => {
    const user = userEvent.setup();
    render(<ControlledInputMask mask={phoneGhMask} />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.type(input, "0241234567");

    expect(input).toHaveValue("024 123 4567");
  });

  it("does not duplicate the leading zero on first keystroke", async () => {
    const user = userEvent.setup();
    render(<ControlledInputMask mask={phoneGhMask} />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.type(input, "0");

    expect(input).toHaveValue("0");
  });

  it("removes the previous digit when backspacing after a separator", async () => {
    const user = userEvent.setup();
    render(<ControlledInputMask mask={phoneGhMask} initialValue="024 " />);

    const input = screen.getByRole("textbox", { name: "Phone number" });
    await user.click(input);
    await user.keyboard("{End}{Backspace}");

    expect(input).toHaveValue("02");
  });

  it("updates when controlled value changes from parent", () => {
    const { rerender } = render(
      <InputMask ariaLabel="Phone number" mask={phoneMask} value="" onChange={vi.fn()} />,
    );

    rerender(
      <InputMask
        ariaLabel="Phone number"
        mask={phoneMask}
        value="(123) 456-7890"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Phone number" })).toHaveValue(
      "(123) 456-7890",
    );
  });
});
