import type { ReactNode } from "react";
import type { DropdownOption } from "../../../types/dropdown";
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
  invalid?: boolean;
  formatOption?: (option: DropdownOption | null, state: "selected" | "idle" | "empty") => ReactNode;
}

export function FieldMappingSelect({
  ariaLabel,
  value,
  onChange,
  options,
  placeholder = "Select...",
  clearable = false,
  invalid = false,
  formatOption,
}: FieldMappingSelectProps) {
  return (
    <Dropdown
      aria-label={ariaLabel}
      value={value}
      onValueChange={onChange}
      options={options}
      placeholder={placeholder}
      clearable={clearable}
      invalid={invalid}
      formatOption={formatOption}
    />
  );
}
