import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("renders children and tooltip content", () => {
    render(
      <Tooltip content="Helper text">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    expect(screen.getByRole("button", { name: "Hover me" })).toBeInTheDocument();
    const tooltip = document.querySelector('[role="tooltip"]');
    expect(tooltip).toHaveTextContent("Helper text");
  });

  it("shows tooltip on hover", () => {
    render(
      <Tooltip content="Helper text">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const tooltip = document.querySelector('[role="tooltip"]')!;
    expect(tooltip).not.toHaveClass("gsl-tooltip__content--open");

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover me" }));
    expect(tooltip).toHaveClass("gsl-tooltip__content--open");
  });

  it("applies side class on content", () => {
    render(
      <Tooltip content="Right tooltip" side="right">
        <button type="button">Target</button>
      </Tooltip>,
    );

    expect(
      document.querySelector('[role="tooltip"]'),
    ).toHaveClass("gsl-tooltip__content--right");
  });

  it("defaults to top side", () => {
    render(
      <Tooltip content="Top tooltip">
        <button type="button">Target</button>
      </Tooltip>,
    );

    expect(
      document.querySelector('[role="tooltip"]'),
    ).toHaveClass("gsl-tooltip__content--top");
  });

  it("merges classNames", () => {
    render(
      <Tooltip
        content="Styled"
        classNames={{ root: "custom-root", content: "custom-content" }}
      >
        <button type="button">Target</button>
      </Tooltip>,
    );

    const tooltip = document.querySelector('[role="tooltip"]')!;
    expect(tooltip).toHaveClass("custom-content");
    expect(document.querySelector(".gsl-tooltip")).toHaveClass("custom-root");
  });

  it("merges className onto root", () => {
    render(
      <Tooltip content="Extra" className="extra-class">
        <button type="button">Target</button>
      </Tooltip>,
    );

    expect(document.querySelector(".gsl-tooltip")).toHaveClass("extra-class");
  });

  it("forwards ref to root element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Tooltip
        content="Ref"
        ref={(node) => {
          (ref as { current: HTMLDivElement | null }).current = node;
        }}
      >
        <span>Child</span>
      </Tooltip>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders ReactNode content", () => {
    render(
      <Tooltip content={<em data-testid="rich-content">rich content</em>}>
        <button type="button">Target</button>
      </Tooltip>,
    );

    expect(screen.getByTestId("rich-content")).toBeInTheDocument();
    expect(screen.getByTestId("rich-content")).toHaveTextContent("rich content");
  });
});
