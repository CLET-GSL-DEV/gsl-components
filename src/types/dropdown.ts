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

export interface DropdownProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: DropdownOption[];
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  "aria-label"?: string;
  classNames?: DropdownClassNames;
  className?: string;
}
