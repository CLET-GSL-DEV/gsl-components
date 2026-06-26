import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { forwardRef, useCallback, useMemo, useState } from "react";
import type {
  SortableHandleProps,
  SortableItemProps,
  SortableListProps,
  SortableProps,
} from "../../types/sortable";
import { cn } from "../../utils/cn";
import { reorderItems } from "./hooks/useSortableDragEnd";
import {
  SortableItemProvider,
  SortableProvider,
  useSortableContext,
  useSortableHandleRegistration,
  useSortableItemContext,
} from "./SortableContext";
import "./styles/sortable.css";

export const Sortable = forwardRef<HTMLDivElement, SortableProps>(
  function Sortable(
    {
      items,
      onReorder,
      disabled = false,
      classNames,
      className,
      children,
    },
    ref,
  ) {
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const nextItems = reorderItems(
          items,
          event.active.id,
          event.over?.id,
        );

        if (nextItems !== items) {
          onReorder(nextItems);
        }
      },
      [items, onReorder],
    );

    return (
      <SortableProvider items={items} disabled={disabled}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div
            ref={ref}
            className={cn(
              "gsl-sortable",
              disabled && "gsl-sortable--disabled",
              classNames?.root,
              className,
            )}
          >
            {children}
          </div>
        </DndContext>
      </SortableProvider>
    );
  },
);

export const SortableList = forwardRef<HTMLDivElement, SortableListProps>(
  function SortableList(
    { strategy = "vertical", classNames, className, children },
    ref,
  ) {
    const { items } = useSortableContext();

    const sortingStrategy = useMemo(
      () =>
        strategy === "horizontal"
          ? horizontalListSortingStrategy
          : verticalListSortingStrategy,
      [strategy],
    );

    return (
      <SortableContext items={items} strategy={sortingStrategy}>
        <div
          ref={ref}
          className={cn(
            "gsl-sortable__list",
            strategy === "horizontal" && "gsl-sortable__list--horizontal",
            classNames?.list,
            className,
          )}
        >
          {children}
        </div>
      </SortableContext>
    );
  },
);

export const SortableItem = forwardRef<HTMLDivElement, SortableItemProps>(
  function SortableItem(
    { id, disabled: disabledProp = false, classNames, className, children },
    ref,
  ) {
    const { disabled: contextDisabled } = useSortableContext();
    const disabled = contextDisabled || disabledProp;
    const [handleCount, setHandleCount] = useState(0);

    const registerHandle = useMemo(
      () => () => {
        setHandleCount((count) => count + 1);

        return () => {
          setHandleCount((count) => Math.max(0, count - 1));
        };
      },
      [],
    );

    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      disabled,
    });

    const hasHandle = handleCount > 0;

    const style = useMemo(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition,
      }),
      [transform, transition],
    );

    const itemContext = useMemo(
      () => ({
        disabled,
        hasHandle,
        registerHandle,
        setNodeRef,
        setActivatorNodeRef,
        attributes,
        listeners: disabled ? undefined : listeners,
        style,
        isDragging,
      }),
      [
        disabled,
        hasHandle,
        registerHandle,
        setNodeRef,
        setActivatorNodeRef,
        attributes,
        listeners,
        style,
        isDragging,
      ],
    );

    return (
      <SortableItemProvider value={itemContext}>
        <SortableItemRoot
          ref={ref}
          classNames={classNames}
          className={className}
        >
          {children}
        </SortableItemRoot>
      </SortableItemProvider>
    );
  },
);

const SortableItemRoot = forwardRef<
  HTMLDivElement,
  Pick<SortableItemProps, "classNames" | "className" | "children">
>(function SortableItemRoot({ classNames, className, children }, ref) {
  const {
    disabled,
    hasHandle,
    setNodeRef,
    attributes,
    listeners,
    style,
    isDragging,
  } = useSortableItemContext();

  return (
    <div
      ref={(node) => {
        setNodeRef(node);

        if (typeof ref === "function") {
          ref(node);
          return;
        }

        if (ref) {
          ref.current = node;
        }
      }}
      className={cn(
        "gsl-sortable__item",
        isDragging && "gsl-sortable__item--dragging",
        disabled && "gsl-sortable__item--disabled",
        !hasHandle && !disabled && "gsl-sortable__item--draggable",
        classNames?.item,
        className,
      )}
      style={style}
      {...attributes}
      {...(!hasHandle && !disabled ? listeners : undefined)}
    >
      {children}
    </div>
  );
});

export const SortableHandle = forwardRef<HTMLButtonElement, SortableHandleProps>(
  function SortableHandle(
    { classNames, className, children, disabled: disabledProp, ...props },
    ref,
  ) {
    const {
      disabled: contextDisabled,
      isDragging,
      setActivatorNodeRef,
      listeners,
    } = useSortableItemContext();
    useSortableHandleRegistration();
    const disabled = contextDisabled || disabledProp;

    return (
      <button
        ref={(node) => {
          setActivatorNodeRef(node);

          if (typeof ref === "function") {
            ref(node);
            return;
          }

          if (ref) {
            ref.current = node;
          }
        }}
        type="button"
        className={cn(
          "gsl-sortable__handle",
          isDragging && "gsl-sortable__handle--dragging",
          classNames?.handle,
          className,
        )}
        aria-grabbed={isDragging}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        {...(!disabled ? listeners : undefined)}
        {...props}
      >
        {children ?? <GripVertical size={16} strokeWidth={2} aria-hidden />}
      </button>
    );
  },
);
