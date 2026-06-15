import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { SortableId } from "../../types/sortable";

interface SortableContextValue {
  items: SortableId[];
  disabled: boolean;
}

const SortableContext = createContext<SortableContextValue | null>(null);

export function SortableProvider({
  items,
  disabled,
  children,
}: {
  items: SortableId[];
  disabled: boolean;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      items,
      disabled,
    }),
    [items, disabled],
  );

  return (
    <SortableContext.Provider value={value}>{children}</SortableContext.Provider>
  );
}

export function useSortableContext() {
  const context = useContext(SortableContext);

  if (!context) {
    throw new Error("Sortable parts must be used within Sortable");
  }

  return context;
}

interface SortableItemContextValue {
  disabled: boolean;
  hasHandle: boolean;
  registerHandle: () => () => void;
  setNodeRef: (node: HTMLElement | null) => void;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  style: CSSProperties;
  isDragging: boolean;
}

const SortableItemContext = createContext<SortableItemContextValue | null>(null);

export function SortableItemProvider({
  value,
  children,
}: {
  value: SortableItemContextValue;
  children: ReactNode;
}) {
  return (
    <SortableItemContext.Provider value={value}>
      {children}
    </SortableItemContext.Provider>
  );
}

export function useSortableItemContext() {
  const context = useContext(SortableItemContext);

  if (!context) {
    throw new Error("Sortable item parts must be used within SortableItem");
  }

  return context;
}

export function useSortableHandleRegistration() {
  const { registerHandle } = useSortableItemContext();

  useEffect(() => registerHandle(), [registerHandle]);
}
