import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SortableId } from "../../types/sortable";
import { reorderItems } from "./hooks/useSortableDragEnd";
import { Sortable, SortableHandle, SortableItem, SortableList } from "./Sortable";

function renderSortableList({
  items = ["alpha", "beta", "gamma"],
  onReorder = vi.fn(),
  disabled = false,
}: {
  items?: SortableId[];
  onReorder?: (items: SortableId[]) => void;
  disabled?: boolean;
} = {}) {
  return render(
    <Sortable items={items} onReorder={onReorder} disabled={disabled}>
      <SortableList>
        {items.map((id) => (
          <SortableItem key={id} id={id}>
            <SortableHandle aria-label={`Reorder ${id}`} />
            <span>{id}</span>
          </SortableItem>
        ))}
      </SortableList>
    </Sortable>,
  );
}

describe("Sortable", () => {
  it("renders list items in order with base classes", () => {
    renderSortableList();

    const items = screen.getAllByText(/^(alpha|beta|gamma)$/);
    expect(items.map((item) => item.textContent)).toEqual(["alpha", "beta", "gamma"]);
    expect(document.querySelectorAll(".gsl-sortable__item")).toHaveLength(3);
    expect(document.querySelector(".gsl-sortable__list")).toBeInTheDocument();
  });

  it("marks disabled state on root and handle", () => {
    renderSortableList({ disabled: true });

    expect(document.querySelector(".gsl-sortable--disabled")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reorder alpha" })).toBeDisabled();
  });

  it("merges handle classNames", () => {
    render(
      <Sortable items={["alpha"]} onReorder={vi.fn()}>
        <SortableList>
          <SortableItem id="alpha">
            <SortableHandle
              aria-label="Reorder alpha"
              className="custom-handle"
              classNames={{ handle: "extra-handle" }}
            />
            <span>alpha</span>
          </SortableItem>
        </SortableList>
      </Sortable>,
    );

    const handle = screen.getByRole("button", { name: "Reorder alpha" });
    expect(handle).toHaveClass(
      "gsl-sortable__handle",
      "custom-handle",
      "extra-handle",
    );
  });

  it("calls onReorder when drag ends with a new order", () => {
    const onReorder = vi.fn();
    const items = ["alpha", "beta", "gamma"];

    renderSortableList({ items, onReorder });

    const nextItems = reorderItems(items, "alpha", "gamma");
    onReorder(nextItems);

    expect(onReorder).toHaveBeenCalledWith(["beta", "gamma", "alpha"]);
  });

  it("renders draggable item surface when no handle is present", () => {
    render(
      <Sortable items={["alpha"]} onReorder={vi.fn()}>
        <SortableList>
          <SortableItem id="alpha">
            <span>alpha</span>
          </SortableItem>
        </SortableList>
      </Sortable>,
    );

    expect(document.querySelector(".gsl-sortable__item--draggable")).toBeInTheDocument();
  });
});
