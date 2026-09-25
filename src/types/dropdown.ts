import type { ReactNode } from "react";
import type { AccessibleName } from "./accessible-name";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownClassNames {
  root?: string;
  trigger?: string;
  icon?: string;
  menu?: string;
  option?: string;
}

interface DropdownBaseProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: DropdownOption[];
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  formatOption?: (option: DropdownOption | null, state: "selected" | "idle" | "empty") => ReactNode;
  classNames?: DropdownClassNames;
  className?: string;
  /**
   * Native form field name. When set, Dropdown participates in native
   * `<form>`/`FormData` submission like a real input — no separate hidden
   * input needed.
   */
  name?: string;
  required?: boolean;
  form?: string;
}

/**
 * A Dropdown shows its selected value, never its purpose, so it must be named.
 * Pass `aria-label`, or `aria-labelledby` pointing at a visible label.
 */
export type DropdownProps = DropdownBaseProps & AccessibleName;
