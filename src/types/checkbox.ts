import type { ReactNode } from "react";

export interface CheckboxClassNames {
  root?: string;
  control?: string;
  indicator?: string;
  icon?: string;
  label?: string;
}

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  "aria-label"?: string;
  classNames?: CheckboxClassNames;
  className?: string;
}
