import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
  RefObject,
} from "react";

export type DraggableAxis = "both" | "x" | "y";

export type DraggableBounds =
  | "parent"
  | "window"
  | { left?: number; top?: number; right?: number; bottom?: number };

export interface DraggablePosition {
  x: number;
  y: number;
}

export interface DraggableClassNames {
  root?: string;
  handle?: string;
}

export interface DraggableProps {
  children: ReactNode;
  axis?: DraggableAxis;
  bounds?: DraggableBounds;
  disabled?: boolean;
  position?: DraggablePosition;
  defaultPosition?: DraggablePosition;
  onPositionChange?: (position: DraggablePosition) => void;
  classNames?: DraggableClassNames;
  className?: string;
}

export interface DraggableHandleProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  classNames?: Pick<DraggableClassNames, "handle">;
  className?: string;
}

export interface UseDraggableOptions {
  axis?: DraggableAxis;
  bounds?: DraggableBounds;
  disabled?: boolean;
  position?: DraggablePosition;
  defaultPosition?: DraggablePosition;
  onPositionChange?: (position: DraggablePosition) => void;
}

export interface UseDraggableReturn {
  position: DraggablePosition;
  dragging: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  rootStyle: CSSProperties;
  handlePointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  rootPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}
