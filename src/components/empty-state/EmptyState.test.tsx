import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No certificates yet"
        description="Add certificates, policies and staff records."
      />,
    );
    expect(screen.getByText("No certificates yet")).toBeInTheDocument();
    expect(
      screen.getByText("Add certificates, policies and staff records."),
    ).toBeInTheDocument();
  });

  it("renders illustration and action slots when provided", () => {
    render(
      <EmptyState
        illustration={<span data-testid="art" />}
        title="Empty"
        action={<button type="button">Add item</button>}
      />,
    );
    expect(screen.getByTestId("art")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add item" }),
    ).toBeInTheDocument();
  });

  it("renders the default illustration, hidden with null", () => {
    const { container, rerender } = render(<EmptyState title="Empty" />);
    const art = container.querySelector(".clet-empty-state__illustration img");
    expect(art).toBeInTheDocument();

    rerender(<EmptyState title="Empty" illustration={null} />);
    expect(
      container.querySelector(".clet-empty-state__illustration"),
    ).toBeNull();
  });

  it("renders the icon medallion instead of the default artwork", () => {
    const { container } = render(<EmptyState title="Empty" icon="?" />);
    expect(
      container.querySelector(".clet-empty-state__medallion"),
    ).toHaveTextContent("?");
    expect(
      container.querySelector(".clet-empty-state__illustration"),
    ).toBeNull();
  });

  it("explicit illustration wins over icon", () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        icon="?"
        illustration={<span data-testid="art" />}
      />,
    );
    expect(screen.getByTestId("art")).toBeInTheDocument();
    expect(
      container.querySelector(".clet-empty-state__medallion"),
    ).toBeNull();
  });

  it("merges className and classNames.root", () => {
    const { container } = render(
      <EmptyState title="Empty" className="custom" classNames={{ root: "inner" }} />,
    );
    const root = container.querySelector(".clet-empty-state")!;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("inner");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <EmptyState ref={ref} title="Empty" />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
