import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("forwards ref to the native input", () => {
    const ref = createRef<HTMLInputElement>();

    render(<Input ref={ref} defaultValue="hello" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.value).toBe("hello");
  });

  it("applies invalid styling and aria-invalid", () => {
    render(<Input invalid aria-label="Email" />);

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveClass("clet-input--invalid");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("applies disabled styling", () => {
    render(<Input disabled aria-label="Email" />);

    expect(screen.getByRole("textbox", { name: "Email" })).toHaveClass("clet-input--disabled");
  });
});
