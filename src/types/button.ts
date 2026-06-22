import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "primary-destructive" | "success";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonClassNames {
  root?: string;
  label?: string;
  spinner?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  classNames?: ButtonClassNames;
  children?: ReactNode;
}
