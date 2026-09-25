import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExpandableItem } from "./ExpandableItem";

describe("ExpandableItem", () => {
  it("renders title and trailing slot, collapsed by default", () => {
    render(
      <ExpandableItem title="LEAT/2026/LIC/007" trailing="closed">
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

  it("renders with no title", () => {
    const { container } = render(
      <ExpandableItem trailing="closed">
        <p>Panel content</p>
      </ExpandableItem>,
    );
    expect(
      container.querySelector(".clet-expandable-item__title"),
    ).toBeNull();
  });

  it("opens on header click and folds only via the toggle", async () => {
    const user = userEvent.setup();
    render(
      <ExpandableItem title="Item">
        <p>Panel content</p>
      </ExpandableItem>,
    );

    // Clicking the title text opens the item.
    await user.click(screen.getByText("Item"));
    expect(screen.getByRole("button", { name: "Collapse" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    // Clicking the header while open does nothing; only the button folds.
    await user.click(screen.getByText("Item"));
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

  it("ignores header clicks on interactive children", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ExpandableItem
        title="Item"
        trailing={
          <button type="button" onClick={onAction}>
            Act
          </button>
        }
      >
        <p>Panel content</p>
      </ExpandableItem>,
    );

    await user.click(screen.getByRole("button", { name: "Act" }));
    expect(onAction).toHaveBeenCalled();
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
