import * as Select from "@radix-ui/react-select";
import "./field-mapping-select.css";

const EMPTY_VALUE = "__gsl_field_mapping_none__";

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
  const selectedOption = options.find((option) => option.value === value);
  const isPlaceholder = !selectedOption;

  return (
    <Select.Root
      value={value ?? EMPTY_VALUE}
      onValueChange={(nextValue) =>
        onChange(nextValue === EMPTY_VALUE ? null : nextValue)
      }
    >
      <div className="gsl-dropdown">
        <Select.Trigger
          className={[
            "gsl-dropdown__trigger",
            isPlaceholder ? "gsl-dropdown__trigger--placeholder" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={ariaLabel}
        >
        <Select.Value placeholder={placeholder}>
          {selectedOption?.label}
        </Select.Value>
        <Select.Icon className="gsl-dropdown__trigger-icon" aria-hidden="true">
          ▾
        </Select.Icon>
        </Select.Trigger>
      </div>

      <Select.Portal>
        <Select.Content
          className="gsl-dropdown__menu"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport>
            {clearable ? (
              <Select.Item
                value={EMPTY_VALUE}
                className="gsl-dropdown__option"
              >
                <Select.ItemText>{placeholder}</Select.ItemText>
              </Select.Item>
            ) : null}
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="gsl-dropdown__option"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
