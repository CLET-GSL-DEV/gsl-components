import type { HTMLAttributes } from "react";

export type ProgressBarVariant = "default" | "success" | "warning" | "error";

export type ProgressBarSize = "sm" | "md";

export interface ProgressBarClassNames {
  root?: string;
  indicator?: string;
  value?: string;
}

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  indeterminate?: boolean;
  label?: string;
  showValue?: boolean;
  classNames?: ProgressBarClassNames;
  className?: string;
}
