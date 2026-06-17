import type { ReactNode } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectClassNames {
  root?: string;
  trigger?: string;
  content?: string;
  item?: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  classNames?: SelectClassNames;
  disabled?: boolean;
  invalid?: boolean;
}
