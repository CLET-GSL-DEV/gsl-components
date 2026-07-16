import type { ReactNode } from "react";

export interface SwitchClassNames {
  root?: string;
  track?: string;
  thumb?: string;
  label?: string;
}

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  labelPosition?: "left" | "right";
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  "aria-label"?: string;
  classNames?: SwitchClassNames;
  className?: string;
}
