import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children with default variant and size", () => {
    render(<Badge>New</Badge>);

    const badge = screen.getByText("New");
    expect(badge).toHaveClass("clet-badge", "clet-badge--default", "clet-badge--sm");
  });

  it.each([
    ["default", "clet-badge--default"],
    ["primary", "clet-badge--primary"],
    ["success", "clet-badge--success"],
    ["warning", "clet-badge--warning"],
    ["error", "clet-badge--error"],
    ["outline", "clet-badge--outline"],
  ] as const)("applies %s variant class", (variant, expectedClass) => {
    render(<Badge variant={variant}>{variant}</Badge>);

    expect(screen.getByText(variant)).toHaveClass(expectedClass);
  });

  it("applies size class names", () => {
    render(<Badge size="md">Medium</Badge>);

    expect(screen.getByText("Medium")).toHaveClass("clet-badge--md");
  });

  it("merges className and classNames.root without dropping base classes", () => {
    render(
      <Badge className="custom-root" classNames={{ root: "extra-root" }}>
        Tagged
      </Badge>,
    );

    const badge = screen.getByText("Tagged");
    expect(badge).toHaveClass("clet-badge", "custom-root", "extra-root");
  });

  it("forwards ref to the root span", () => {
    const ref = createRef<HTMLSpanElement>();

    render(<Badge ref={ref}>Ref</Badge>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveTextContent("Ref");
  });
});
