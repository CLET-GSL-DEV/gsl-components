import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "outline";

export type BadgeSize = "sm" | "md";

export interface BadgeClassNames {
  root?: string;
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  classNames?: BadgeClassNames;
  className?: string;
  children: ReactNode;
}
