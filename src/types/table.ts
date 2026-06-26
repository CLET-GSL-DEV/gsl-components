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

/* ── Bulk Actions ── */

export interface TableBulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedIds: Set<string | number>) => void;
  destructive?: boolean;
}

export interface TableBulkActionsClassNames {
  root?: string;
  count?: string;
}

export interface TableBulkActionsProps {
  /** Currently selected row keys */
  selectedIds: Set<string | number>;
  /** Override the displayed count (defaults to selectedIds.size) */
  selectedCount?: number;
  /** Callback to clear all selections */
  onClear?: () => void;
  /** Predefined actions rendered as inline buttons */
  actions?: TableBulkAction[];
  /**
   * Render prop for custom action content.
   * Receives selectedIds so consumers never need to manage selection state directly.
   */
  renderActions?: (params: {
    selectedIds: Set<string | number>;
  }) => ReactNode;
  classNames?: TableBulkActionsClassNames;
  className?: string;
}

/* ── ClassNames ── */

export interface TableClassNames {
  root?: string;
  header?: string;
  content?: string;
  footer?: string;
  selectionCell?: string;
}

/* ── Props ── */

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableClassNames;
  className?: string;
  /** URL param namespace shared by all child table components */
  paramPrefix: string;
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
  /** Show skeleton loading rows instead of data (default false) */
  loading?: boolean;
  /** Number of skeleton rows to show while loading (default 5) */
  loadingRows?: number;
  /** Show a checkbox selection column (default false) */
  selectable?: boolean;
  /** Set of selected row keys. Required with onSelectionChange when selectable. */
  selectedIds?: Set<string | number>;
  /** Called when selection changes. Required with selectedIds when selectable. */
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
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
  applyLabel?: string;
  resetLabel?: string;
  className?: string;
}

export interface PaginationControlsProps {
  totalPages: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  visiblePages?: number;
  className?: string;
}
