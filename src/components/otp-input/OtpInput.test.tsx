import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OtpInput } from "./OtpInput";

describe("OtpInput", () => {
  it("renders the correct number of slots", () => {
    render(<OtpInput length={4} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
  });

  it("renders 6 slots by default", () => {
    render(<OtpInput />);
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
  });

  it("forwards ref to the first input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<OtpInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("applies invalid styling and aria-invalid", () => {
    render(<OtpInput invalid />);
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  it("applies disabled styling", () => {
    render(<OtpInput disabled />);
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("does not accept input when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtpInput disabled onChange={onChange} />);

    await user.type(screen.getAllByRole("textbox")[0], "1");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("merges classNames onto parts", () => {
    render(
      <OtpInput
        classNames={{ root: "custom-root", slot: "custom-slot" }}
        className="custom-classname"
      />,
    );

    expect(document.querySelector(".gsl-otp-input")).toHaveClass("custom-root");
    expect(document.querySelector(".gsl-otp-input")).toHaveClass("custom-classname");
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input).toHaveClass("custom-slot");
    });
  });

  it("calls onChange with the full value when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtpInput length={4} onChange={onChange} />);

    await user.type(screen.getAllByRole("textbox")[0], "1");

    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("auto-advances focus to the next slot on input", async () => {
    const user = userEvent.setup();
    render(<OtpInput length={4} />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "1");

    expect(document.activeElement).toBe(inputs[1]);
  });

  it("fires onComplete when all slots are filled by typing", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OtpInput length={4} onComplete={onComplete} />);

    const inputs = screen.getAllByRole("textbox");
    for (let i = 0; i < 4; i++) {
      await user.type(inputs[i], `${i + 1}`);
    }

    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("fires onComplete when all slots are filled by paste", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OtpInput length={6} onComplete={onComplete} />);

    const inputs = screen.getAllByRole("textbox");
    inputs[0].focus();
    await user.paste("123456");

    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("handles backspace to clear current and move focus", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtpInput length={4} onChange={onChange} />);
    const inputs = screen.getAllByRole("textbox");

    await user.type(inputs[0], "1");
    await user.click(inputs[1]);
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("handles paste from the first slot", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtpInput length={6} onChange={onChange} />);

    screen.getAllByRole("textbox")[0].focus();
    await user.paste("123456");

    expect(onChange).toHaveBeenCalledWith("123456");
  });

  it("handles paste from a non-first slot", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtpInput length={6} onChange={onChange} />);

    const inputs = screen.getAllByRole("textbox");
    inputs[2].focus();
    await user.paste("abc");

    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("navigates with arrow keys", async () => {
    const user = userEvent.setup();
    render(<OtpInput length={4} />);
    const inputs = screen.getAllByRole("textbox");

    inputs[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(inputs[1]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(inputs[0]);
  });

  it("does not move left from the first slot", async () => {
    const user = userEvent.setup();
    render(<OtpInput length={4} />);
    const inputs = screen.getAllByRole("textbox");

    inputs[0].focus();
    await user.keyboard("{ArrowLeft}");

    expect(document.activeElement).toBe(inputs[0]);
  });

  it("does not move right from the last slot", async () => {
    const user = userEvent.setup();
    render(<OtpInput length={4} />);
    const inputs = screen.getAllByRole("textbox");

    inputs[3].focus();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(inputs[3]);
  });

  it("supports controlled value", () => {
    render(<OtpInput length={4} value="12" onChange={() => {}} />);

    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveValue("1");
    expect(inputs[1]).toHaveValue("2");
    expect(inputs[2]).toHaveValue("");
    expect(inputs[3]).toHaveValue("");
  });

  // Uncontrolled mode
  it("manages internal state in uncontrolled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtpInput length={4} onChange={onChange} />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "9");

    expect(onChange).toHaveBeenCalledWith("9");
    expect(inputs[0]).toHaveValue("9");
  });

  it("clears and updates internal state on backspace", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OtpInput length={4} onChange={onChange} />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "5");
    expect(inputs[0]).toHaveValue("5");

    await user.click(inputs[0]);
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenCalledWith("");
  });

  // RHF integration
  it("works with react-hook-form controlled", async () => {
    const user = userEvent.setup();

    function Form() {
      const form = useForm<{ code: string }>({
        defaultValues: { code: "12" },
      });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <OtpInput
            length={4}
            value={form.watch("code")}
            onChange={(v) => form.setValue("code", v)}
          />
          <span data-testid="value">{form.watch("code")}</span>
        </form>
      );
    }

    render(<Form />);

    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveValue("1");
    expect(inputs[1]).toHaveValue("2");
    expect(screen.getByTestId("value")).toHaveTextContent("12");

    await user.type(inputs[2], "3");
    expect(screen.getByTestId("value")).toHaveTextContent("123");
  });
});
