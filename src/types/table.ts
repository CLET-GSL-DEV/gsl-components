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

/* ── Row Actions ── */

export interface TableRowAction<T> {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  /** If provided, must return true for the action to appear for this row */
  condition?: (row: T) => boolean;
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
  renderActions?: (params: { selectedIds: Set<string | number> }) => ReactNode;
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
  height?: number;
}

export interface TableHeaderClassNames {
  root?: string;
}

export interface TableHeaderProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableHeaderClassNames;
  className?: string;
}

export interface TableActionsClassNames {
  root?: string;
}

export interface TableActionsProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableActionsClassNames;
  className?: string;
}

export interface TableContentClassNames {
  root?: string;
  empty?: string;
  emptyIcon?: string;
  emptyText?: string;
  th?: string;
  thLabel?: string;
  sortIcon?: string;
  checkboxCell?: string;
  actionsCell?: string;
  actionsTrigger?: string;
  actionsMenu?: string;
  actionsItem?: string;
  skeleton?: string;
  viewport?: string;
}

export interface TableContentProps<
  T = unknown,
> extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  classNames?: TableContentClassNames;
  columns?: TableColumn<T>[];
  data?: T[];
  rowKey?: (row: T) => string | number;
  /** Icon (JSX/ReactNode) shown above the empty text when data is empty */
  emptyIcon?: ReactNode;
  /** Message shown when data is empty (defaults to "No results") */
  emptyText?: string;
  /** Show skeleton loading rows instead of data (default false) */
  loading?: boolean;
  /** Number of skeleton rows to show while loading (default 5) */
  loadingRows?: number;
  /** Show a checkbox selection column (default false) */
  selectable?: boolean;
  /** Current set of selected row keys. Pass with onSelectionChange for controlled mode. Required for TableBulkActions sync. */
  selectedIds?: Set<string | number>;
  /** Called when selection changes with the full set of selected row keys */
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  /** Row-level actions rendered as a kebab dropdown at the end of each row */
  rowActions?: TableRowAction<T>[];
  /** Row height in px. Set this to enable virtual scrolling. Parent <Table> must have a height set. */
  virtualRowHeight?: number;
}

export interface TableFooterClassNames {
  root?: string;
}

export interface TableFooterProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableFooterClassNames;
  className?: string;
}

export interface TableSearchClassNames {
  root?: string;
  icon?: string;
  input?: string;
  clear?: string;
}

export interface TableSearchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "children"
> {
  placeholder?: string;
  debounceMs?: number;
  onSearch?: (value: string) => void;
  classNames?: TableSearchClassNames;
  className?: string;
}

export interface TableFilterClassNames {
  root?: string;
  trigger?: string;
  badge?: string;
  content?: string;
  header?: string;
  resetButton?: string;
  fields?: string;
  actions?: string;
  applyButton?: string;
}

export interface TableFilterProps {
  children?: ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  applyLabel?: string;
  resetLabel?: string;
  classNames?: TableFilterClassNames;
  className?: string;
}

export interface TablePaginationClassNames {
  root?: string;
  results?: string;
  pageSize?: string;
  pages?: string;
  ellipsis?: string;
}

export interface PaginationControlsProps {
  totalPages: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  visiblePages?: number;
  classNames?: TablePaginationClassNames;
  className?: string;
}
