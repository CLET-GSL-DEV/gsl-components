import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SortableId = string | number;

export type SortableStrategy = "vertical" | "horizontal";

export interface SortableClassNames {
  root?: string;
  list?: string;
  item?: string;
  handle?: string;
}

export interface SortableProps {
  items: SortableId[];
  onReorder: (items: SortableId[]) => void;
  disabled?: boolean;
  classNames?: SortableClassNames;
  className?: string;
  children: ReactNode;
}

export interface SortableListProps {
  strategy?: SortableStrategy;
  classNames?: Pick<SortableClassNames, "list">;
  className?: string;
  children: ReactNode;
}

export interface SortableItemProps {
  id: SortableId;
  disabled?: boolean;
  classNames?: Pick<SortableClassNames, "item">;
  className?: string;
  children: ReactNode;
}

export interface SortableHandleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  classNames?: Pick<SortableClassNames, "handle">;
  className?: string;
  children?: ReactNode;
}
