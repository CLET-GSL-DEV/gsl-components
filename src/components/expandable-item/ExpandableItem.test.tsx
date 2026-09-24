import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExpandableItem } from "./ExpandableItem";

describe("ExpandableItem", () => {
  it("renders title and status, collapsed by default", () => {
    render(
      <ExpandableItem title="LEAT/2026/LIC/007" status="closed">
        <p>Panel content</p>
      </ExpandableItem>,
    );
    expect(screen.getByText("LEAT/2026/LIC/007")).toBeInTheDocument();
    expect(screen.getByText("closed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("expands and collapses on toggle click", async () => {
    const user = userEvent.setup();
    render(
      <ExpandableItem title="Item">
        <p>Panel content</p>
      </ExpandableItem>,
    );

    const toggle = screen.getByRole("button", { name: "Expand" });
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Collapse" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Collapse" }));
    expect(screen.getByRole("button", { name: "Expand" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("supports controlled expanded state", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(
      <ExpandableItem
        title="Item"
        expanded={false}
        onExpandedChange={onExpandedChange}
      >
        <p>Panel content</p>
      </ExpandableItem>,
    );

    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Expand" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("merges className and classNames.root", () => {
    const { container } = render(
      <ExpandableItem
        title="Item"
        className="custom"
        classNames={{ root: "inner" }}
      />,
    );
    const root = container.querySelector(".clet-expandable-item")!;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("inner");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ExpandableItem ref={ref} title="Item" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
