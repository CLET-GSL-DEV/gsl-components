import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("renders children and tooltip content", async () => {
    render(
      <Tooltip content="Helper text">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    expect(screen.getByRole("button", { name: "Hover me" })).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover me" }));
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveTextContent("Helper text");
    });
  });

  it("shows tooltip on hover", async () => {
    render(
      <Tooltip content="Helper text">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover me" }));
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]')!;
      expect(tooltip).toHaveClass("clet-tooltip__content--open");
    });
  });

  it("applies side class on content", async () => {
    render(
      <Tooltip content="Right tooltip" side="right">
        <button type="button">Target</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Target" }));
    await waitFor(() => {
      expect(
        document.querySelector('[role="tooltip"]'),
      ).toHaveClass("clet-tooltip__content--right");
    });
  });

  it("defaults to top side", async () => {
    render(
      <Tooltip content="Top tooltip">
        <button type="button">Target</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Target" }));
    await waitFor(() => {
      expect(
        document.querySelector('[role="tooltip"]'),
      ).toHaveClass("clet-tooltip__content--top");
    });
  });

  it("merges classNames", async () => {
    render(
      <Tooltip
        content="Styled"
        classNames={{ root: "custom-root", content: "custom-content" }}
      >
        <button type="button">Target</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Target" }));
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]')!;
      expect(tooltip).toHaveClass("custom-content");
    });
    expect(document.querySelector(".clet-tooltip")).toHaveClass("custom-root");
  });

  it("merges className onto root", () => {
    render(
      <Tooltip content="Extra" className="extra-class">
        <button type="button">Target</button>
      </Tooltip>,
    );

    expect(document.querySelector(".clet-tooltip")).toHaveClass("extra-class");
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

  it("renders ReactNode content", async () => {
    render(
      <Tooltip content={<em data-testid="rich-content">rich content</em>}>
        <button type="button">Target</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Target" }));
    await waitFor(() => {
      expect(screen.getByTestId("rich-content")).toBeInTheDocument();
      expect(screen.getByTestId("rich-content")).toHaveTextContent("rich content");
    });
  });
});
