import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("forwards ref to the native textarea", () => {
    const ref = createRef<HTMLTextAreaElement>();

    render(<Textarea ref={ref} defaultValue="hello" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current?.value).toBe("hello");
  });

  it("applies invalid styling and aria-invalid", () => {
    render(<Textarea invalid aria-label="Message" />);

    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea).toHaveClass("clet-textarea--invalid");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("applies disabled styling", () => {
    render(<Textarea disabled aria-label="Message" />);

    expect(screen.getByRole("textbox", { name: "Message" })).toHaveClass(
      "clet-textarea--disabled",
    );
  });
});
