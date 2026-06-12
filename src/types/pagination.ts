import type { CSSProperties } from "react";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptySummaryText?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
  style?: CSSProperties;
}
