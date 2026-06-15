import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children with default variant and size", () => {
    render(<Badge>New</Badge>);

    const badge = screen.getByText("New");
    expect(badge).toHaveClass("gsl-badge", "gsl-badge--default", "gsl-badge--sm");
  });

  it.each([
    ["default", "gsl-badge--default"],
    ["primary", "gsl-badge--primary"],
    ["success", "gsl-badge--success"],
    ["warning", "gsl-badge--warning"],
    ["error", "gsl-badge--error"],
    ["outline", "gsl-badge--outline"],
  ] as const)("applies %s variant class", (variant, expectedClass) => {
    render(<Badge variant={variant}>{variant}</Badge>);

    expect(screen.getByText(variant)).toHaveClass(expectedClass);
  });

  it("applies size class names", () => {
    render(<Badge size="md">Medium</Badge>);

    expect(screen.getByText("Medium")).toHaveClass("gsl-badge--md");
  });

  it("merges className and classNames.root without dropping base classes", () => {
    render(
      <Badge className="custom-root" classNames={{ root: "extra-root" }}>
        Tagged
      </Badge>,
    );

    const badge = screen.getByText("Tagged");
    expect(badge).toHaveClass("gsl-badge", "custom-root", "extra-root");
  });

  it("forwards ref to the root span", () => {
    const ref = createRef<HTMLSpanElement>();

    render(<Badge ref={ref}>Ref</Badge>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveTextContent("Ref");
  });
});
