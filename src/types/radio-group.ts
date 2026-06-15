import type { ReactNode } from "react";

export type RadioGroupVariant = "default" | "card";

export interface RadioGroupClassNames {
  root?: string;
}

export interface RadioClassNames {
  root?: string;
  control?: string;
  indicator?: string;
  content?: string;
  label?: string;
  description?: string;
}

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
  variant?: RadioGroupVariant;
  classNames?: RadioGroupClassNames;
  className?: string;
  children: ReactNode;
}

export interface RadioProps {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  classNames?: RadioClassNames;
  className?: string;
}
