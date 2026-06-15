import { useCallback, useRef, useState, type CSSProperties } from "react";
import type {
  DraggablePosition,
  UseDraggableOptions,
  UseDraggableReturn,
} from "../../../types/draggable";
import { clampPosition } from "./clampPosition";

const DEFAULT_POSITION: DraggablePosition = { x: 0, y: 0 };

export function useDraggable({
  axis = "both",
  bounds = "parent",
  disabled = false,
  position: positionProp,
  defaultPosition = DEFAULT_POSITION,
  onPositionChange,
}: UseDraggableOptions = {}): UseDraggableReturn {
  const rootRef = useRef<HTMLDivElement>(null);
  const [uncontrolledPosition, setUncontrolledPosition] =
    useState(defaultPosition);
  const [dragging, setDragging] = useState(false);
  const dragStateRef = useRef<{
    pointerId: number;
    startPointer: DraggablePosition;
    startPosition: DraggablePosition;
  } | null>(null);

  const isControlled = positionProp !== undefined;
  const position = isControlled ? positionProp : uncontrolledPosition;

  const setPosition = useCallback(
    (next: DraggablePosition) => {
      if (!isControlled) {
        setUncontrolledPosition(next);
      }

      onPositionChange?.(next);
    },
    [isControlled, onPositionChange],
  );

  const updatePosition = useCallback(
    (next: DraggablePosition) => {
      const node = rootRef.current;

      if (!node) {
        setPosition(next);
        return;
      }

      const clamped = clampPosition({
        position: next,
        currentPosition: position,
        axis,
        bounds,
        node,
      });

      setPosition(clamped);
    },
    [axis, bounds, position, setPosition],
  );

  const endDrag = useCallback((event: PointerEvent) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    setDragging(false);

    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - dragState.startPointer.x;
      const deltaY = event.clientY - dragState.startPointer.y;

      updatePosition({
        x: dragState.startPosition.x + deltaX,
        y: dragState.startPosition.y + deltaY,
      });
    },
    [updatePosition],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled || event.button !== 0) {
        return;
      }

      event.preventDefault();

      const target = event.currentTarget;

      dragStateRef.current = {
        pointerId: event.pointerId,
        startPointer: { x: event.clientX, y: event.clientY },
        startPosition: position,
      };
      setDragging(true);
      target.setPointerCapture(event.pointerId);

      const onPointerMove = (moveEvent: PointerEvent) => {
        handlePointerMove(moveEvent);
      };
      const onPointerUp = (upEvent: PointerEvent) => {
        endDrag(upEvent);
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
        target.removeEventListener("pointercancel", onPointerUp);
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
      target.addEventListener("pointercancel", onPointerUp);
    },
    [disabled, endDrag, handlePointerMove, position],
  );

  const rootStyle: CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px)`,
  };

  return {
    position,
    dragging,
    rootRef,
    rootStyle,
    handlePointerDown: handlePointerDown,
    rootPointerDown: handlePointerDown,
  };
}
