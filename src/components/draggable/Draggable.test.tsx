import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Draggable, DraggableHandle } from "./Draggable";

describe("Draggable", () => {
  it("renders children with base draggable classes", () => {
    const { container } = render(
      <div style={{ position: "relative", width: 320, height: 240 }}>
        <Draggable>
          <DraggableHandle aria-label="Drag panel" />
          <div>Panel content</div>
        </Draggable>
      </div>,
    );

    expect(container.querySelector(".clet-draggable")).toBeInTheDocument();
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("applies defaultPosition via transform", () => {
    const { container } = render(
      <Draggable defaultPosition={{ x: 24, y: 16 }}>
        <div>Panel</div>
      </Draggable>,
    );

    const root = container.querySelector(".clet-draggable") as HTMLElement;
    expect(root.style.transform).toBe("translate(24px, 16px)");
  });

  it("applies controlled position via transform", () => {
    const { container } = render(
      <Draggable position={{ x: 8, y: 12 }}>
        <div>Panel</div>
      </Draggable>,
    );

    const root = container.querySelector(".clet-draggable") as HTMLElement;
    expect(root.style.transform).toBe("translate(8px, 12px)");
  });

  it("marks disabled state on root and handle", () => {
    render(
      <Draggable disabled>
        <DraggableHandle aria-label="Drag panel">Handle</DraggableHandle>
      </Draggable>,
    );

    expect(document.querySelector(".clet-draggable--disabled")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Drag panel" })).toBeDisabled();
  });

  it("merges handle classNames", () => {
    render(
      <Draggable>
        <DraggableHandle
          aria-label="Drag panel"
          className="custom-handle"
          classNames={{ handle: "extra-handle" }}
        />
      </Draggable>,
    );

    const handle = screen.getByRole("button", { name: "Drag panel" });
    expect(handle).toHaveClass("clet-draggable__handle", "custom-handle", "extra-handle");
  });

  it("calls onPositionChange when dragging the handle", () => {
    const onPositionChange = vi.fn();

    render(
      <div style={{ position: "relative", width: 320, height: 240 }}>
        <Draggable onPositionChange={onPositionChange}>
          <DraggableHandle aria-label="Drag panel" />
          <div>Panel</div>
        </Draggable>
      </div>,
    );

    const handle = screen.getByRole("button", { name: "Drag panel" });

    fireEvent.pointerDown(handle, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 30, clientY: 25, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientX: 30, clientY: 25, pointerId: 1 });

    expect(onPositionChange).toHaveBeenCalled();
    const lastCall = onPositionChange.mock.calls[onPositionChange.mock.calls.length - 1]?.[0];
    expect(lastCall.x).toBeGreaterThan(0);
    expect(lastCall.y).toBeGreaterThan(0);
  });
});
