import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export interface TableBuilderClassNames {
  root?: string;
  header?: string;
  content?: string;
  footer?: string;
}

export interface TableBuilderProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: TableBuilderClassNames;
  className?: string;
}

export interface TableBuilderHeaderProps
  extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface TableBuilderContentProps
  extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface TableBuilderFooterProps
  extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface TableBuilderSearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> {
  placeholder?: string;
  debounceMs?: number;
  onSearch?: (value: string) => void;
  className?: string;
}

export interface TableBuilderFilterProps {
  /** Content inside the filter popover (form fields, etc.) */
  children?: ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  applyLabel?: string;
  resetLabel?: string;
  className?: string;
}

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}
