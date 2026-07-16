import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Notice } from "./Notice";

describe("Notice", () => {
  it("renders title and children with default variant", () => {
    render(<Notice title="Heads up">Body copy</Notice>);

    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Body copy")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("clet-notice--default");
  });

  it.each([
    ["default", "clet-notice--default"],
    ["info", "clet-notice--info"],
    ["success", "clet-notice--success"],
    ["warning", "clet-notice--warning"],
    ["error", "clet-notice--error"],
  ] as const)("applies %s variant class", (variant, expectedClass) => {
    render(
      <Notice variant={variant} title={variant}>
        Body
      </Notice>,
    );

    expect(screen.getByText(variant).closest(".clet-notice")).toHaveClass(
      expectedClass,
    );
  });

  it("uses role=alert for the error variant and role=status otherwise", () => {
    const { rerender } = render(<Notice variant="warning">Body</Notice>);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<Notice variant="error">Body</Notice>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies leftBorder and dashed modifier classes", () => {
    render(
      <Notice variant="warning" leftBorder dashed>
        Body
      </Notice>,
    );

    const root = screen.getByRole("status");
    expect(root).toHaveClass("clet-notice--left-border", "clet-notice--dashed");
  });

  it("sets a custom --clet-notice-accent when color is passed", () => {
    render(
      <Notice color="#ff00ff" title="Custom">
        Body
      </Notice>,
    );

    const root = screen.getByRole("status");
    expect(root.style.getPropertyValue("--clet-notice-accent")).toBe(
      "#ff00ff",
    );
  });

  it("renders an optional leading icon", () => {
    render(
      <Notice icon={<span data-testid="dot" />} title="With icon">
        Body
      </Notice>,
    );

    expect(screen.getByTestId("dot").closest(".clet-notice__icon")).toBeInTheDocument();
  });

  it("merges classNames onto root, header, title, and body", () => {
    render(
      <Notice
        title="Titled"
        classNames={{
          root: "custom-root",
          header: "custom-header",
          title: "custom-title",
          body: "custom-body",
        }}
      >
        Body copy
      </Notice>,
    );

    expect(screen.getByRole("status")).toHaveClass("custom-root");
    expect(document.querySelector(".clet-notice__header")).toHaveClass(
      "custom-header",
    );
    expect(screen.getByText("Titled")).toHaveClass("custom-title");
    expect(screen.getByText("Body copy")).toHaveClass("custom-body");
  });

  it("forwards ref to the root div", () => {
    const ref = createRef<HTMLDivElement>();

    render(<Notice ref={ref}>Body</Notice>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
