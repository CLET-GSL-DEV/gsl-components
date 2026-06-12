import type { CSSProperties, ReactNode } from "react";

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T, value: unknown) => ReactNode;
  width?: string | number;
}

export interface DataTableSort {
  key: string;
  direction: "asc" | "desc";
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  getRowId?: (row: T, index: number) => string | number;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyText?: string;
  loadingLabel?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  style?: CSSProperties;
}

export interface UseDataTableOptions<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  initialPageSize?: number;
}

export interface UseDataTableReturn<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  sort: DataTableSort | null;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  toggleSort: (columnKey: string) => void;
}
