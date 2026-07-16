import type { HTMLAttributes } from "react";

/**
 * @deprecated `NetworkOperator` is deprecated in favor of `Combobox` (build an
 * operator list with `options`) — see the migration guide.
 */
export interface NetworkOperatorOption {
  value: string;
  label: string;
  image?: string;
}

export interface NetworkOperatorClassNames {
  root?: string;
  trigger?: string;
  menu?: string;
  option?: string;
  image?: string;
}

/**
 * @deprecated `NetworkOperator` is deprecated in favor of `Combobox` (build an
 * operator list with `options`) — see the migration guide.
 */
export interface NetworkOperatorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  invalid?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  options?: NetworkOperatorOption[];
  classNames?: NetworkOperatorClassNames;
  className?: string;
}
