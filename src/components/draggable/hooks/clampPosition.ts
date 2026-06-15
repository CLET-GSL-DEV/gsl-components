import type {
  DraggableAxis,
  DraggableBounds,
  DraggablePosition,
} from "../../../types/draggable";

export interface ClampPositionInput {
  position: DraggablePosition;
  currentPosition: DraggablePosition;
  axis: DraggableAxis;
  bounds: DraggableBounds;
  node: HTMLElement;
}

export function clampPosition({
  position,
  currentPosition,
  axis,
  bounds,
  node,
}: ClampPositionInput): DraggablePosition {
  let x = axis === "y" ? currentPosition.x : position.x;
  let y = axis === "x" ? currentPosition.y : position.y;

  if (bounds === "parent") {
    const parent = node.offsetParent as HTMLElement | null;

    if (parent) {
      const minX = -node.offsetLeft;
      const maxX = parent.clientWidth - node.offsetLeft - node.offsetWidth;
      const minY = -node.offsetTop;
      const maxY = parent.clientHeight - node.offsetTop - node.offsetHeight;
      x = Math.min(maxX, Math.max(minX, x));
      y = Math.min(maxY, Math.max(minY, y));
    }
  } else if (bounds === "window") {
    const rect = node.getBoundingClientRect();
    const deltaX = x - currentPosition.x;
    const deltaY = y - currentPosition.y;
    let left = rect.left + deltaX;
    let top = rect.top + deltaY;
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const maxTop = Math.max(0, window.innerHeight - rect.height);
    left = Math.min(maxLeft, Math.max(0, left));
    top = Math.min(maxTop, Math.max(0, top));
    x = currentPosition.x + (left - rect.left);
    y = currentPosition.y + (top - rect.top);
  } else {
    if (bounds.left !== undefined) {
      x = Math.max(bounds.left, x);
    }

    if (bounds.right !== undefined) {
      x = Math.min(bounds.right, x);
    }

    if (bounds.top !== undefined) {
      y = Math.max(bounds.top, y);
    }

    if (bounds.bottom !== undefined) {
      y = Math.min(bounds.bottom, y);
    }
  }

  return { x, y };
}
