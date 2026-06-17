import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

/* ── Column definition ── */

export interface TableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => ReactNode;
  cell?: (info: { row: T; value: ReactNode }) => ReactNode;
  /** Width in px. If omitted, column shares remaining space equally. */
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

/* ── Sort ── */

export type SortDirection = "asc" | "desc";

export interface TableSortState {
  column: string;
  direction: SortDirection;
}

/* ── ClassNames ── */

export interface TableClassNames {
  root?: string;
  header?: string;
  content?: string;
  footer?: string;
}

/* ── Props ── */

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableClassNames;
  className?: string;
}

export interface TableHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface TableContentProps<T = unknown>
  extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  columns?: TableColumn<T>[];
  data?: T[];
  rowKey?: (row: T) => string | number;
}

export interface TableFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface TableSearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> {
  placeholder?: string;
  debounceMs?: number;
  onSearch?: (value: string) => void;
  className?: string;
}

export interface TableFilterProps {
  children?: ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  activeCount?: number;
  applyLabel?: string;
  resetLabel?: string;
  className?: string;
}

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  visiblePages?: number;
  className?: string;
}
