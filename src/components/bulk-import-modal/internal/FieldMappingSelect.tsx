import { Dropdown } from "../../dropdown/Dropdown";

export interface FieldMappingSelectOption {
  value: string;
  label: string;
}

export interface FieldMappingSelectProps {
  ariaLabel: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: FieldMappingSelectOption[];
  placeholder?: string;
  clearable?: boolean;
}

export function FieldMappingSelect({
  ariaLabel,
  value,
  onChange,
  options,
  placeholder = "Select...",
  clearable = false,
}: FieldMappingSelectProps) {
  return (
    <Dropdown
      aria-label={ariaLabel}
      value={value}
      onValueChange={onChange}
      options={options}
      placeholder={placeholder}
      clearable={clearable}
    />
  );
}
