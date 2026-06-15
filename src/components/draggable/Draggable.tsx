import { GripVertical } from "lucide-react";
import { forwardRef } from "react";
import type { DraggableHandleProps, DraggableProps } from "../../types/draggable";
import { cn } from "../../utils/cn";
import {
  DraggableProvider,
  useDraggableContext,
  useDraggableHandleRegistration,
} from "./DraggableContext";
import { useDraggable } from "./hooks/useDraggable";
import "./styles/draggable.css";

export const Draggable = forwardRef<HTMLDivElement, DraggableProps>(
  function Draggable(
    {
      axis = "both",
      bounds = "parent",
      disabled = false,
      position,
      defaultPosition,
      onPositionChange,
      classNames,
      className,
      children,
    },
    ref,
  ) {
    const draggable = useDraggable({
      axis,
      bounds,
      disabled,
      position,
      defaultPosition,
      onPositionChange,
    });

    return (
      <DraggableProvider disabled={disabled} draggable={draggable}>
        <DraggableRoot ref={ref} classNames={classNames} className={className}>
          {children}
        </DraggableRoot>
      </DraggableProvider>
    );
  },
);

const DraggableRoot = forwardRef<
  HTMLDivElement,
  Pick<DraggableProps, "classNames" | "className" | "children">
>(function DraggableRoot({ classNames, className, children }, ref) {
  const {
    dragging,
    disabled,
    hasHandle,
    rootRef,
    rootStyle,
    rootPointerDown,
  } = useDraggableContext();

  return (
    <div
      ref={(node) => {
        rootRef.current = node;

        if (typeof ref === "function") {
          ref(node);
          return;
        }

        if (ref) {
          ref.current = node;
        }
      }}
      className={cn(
        "gsl-draggable",
        dragging && "gsl-draggable--dragging",
        disabled && "gsl-draggable--disabled",
        classNames?.root,
        className,
      )}
      style={rootStyle}
      onPointerDown={!hasHandle && !disabled ? rootPointerDown : undefined}
    >
      {children}
    </div>
  );
});

export const DraggableHandle = forwardRef<HTMLButtonElement, DraggableHandleProps>(
  function DraggableHandle(
    { classNames, className, children, disabled: disabledProp, ...props },
    ref,
  ) {
    const { disabled: contextDisabled, dragging, handlePointerDown } =
      useDraggableContext();
    useDraggableHandleRegistration();
    const disabled = contextDisabled || disabledProp;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "gsl-draggable__handle",
          dragging && "gsl-draggable__handle--dragging",
          classNames?.handle,
          className,
        )}
        aria-grabbed={dragging}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {children ?? <GripVertical size={16} strokeWidth={2} aria-hidden />}
      </button>
    );
  },
);
