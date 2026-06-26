import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type { DropdownProps } from "../../types/dropdown";
import { cn } from "../../utils/cn";
import "./styles/dropdown.css";

const EMPTY_VALUE = "__gsl_dropdown_none__";

export function Dropdown({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  clearable = false,
  disabled = false,
  invalid = false,
  "aria-label": ariaLabel,
  formatOption,
  classNames,
  className,
}: DropdownProps) {
  const selectedOption = options.find((option) => option.value === value);
  const isPlaceholder = !selectedOption;

  return (
    <Select.Root
      value={value ?? EMPTY_VALUE}
      onValueChange={(nextValue) =>
        onValueChange(nextValue === EMPTY_VALUE ? null : nextValue)
      }
      disabled={disabled}
    >
      <div className={cn("gsl-dropdown", classNames?.root, className)}>
        <Select.Trigger
          className={cn(
            "gsl-dropdown__trigger",
            isPlaceholder && "gsl-dropdown__trigger--placeholder",
            invalid && "gsl-dropdown__trigger--invalid",
            classNames?.trigger,
          )}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
        >
          <Select.Value placeholder={placeholder}>
            {formatOption
              ? formatOption(selectedOption ?? null, isPlaceholder ? "empty" : "selected")
              : selectedOption?.label ?? placeholder}
          </Select.Value>
          <Select.Icon
            className={cn("gsl-dropdown__trigger-icon", classNames?.icon)}
            aria-hidden="true"
          >
            <ChevronDown size={16} strokeWidth={2} aria-hidden />
          </Select.Icon>
        </Select.Trigger>
      </div>

      <Select.Portal>
        <Select.Content
          className={cn("gsl-dropdown__menu", classNames?.menu)}
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport>
            {clearable ? (
              <Select.Item
                value={EMPTY_VALUE}
                className={cn("gsl-dropdown__option", classNames?.option)}
              >
                <Select.ItemText>{placeholder}</Select.ItemText>
              </Select.Item>
            ) : null}
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn("gsl-dropdown__option", classNames?.option)}
              >
                <Select.ItemText>
                  {formatOption
                    ? formatOption(option, option.value === value ? "selected" : "idle")
                    : option.label}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
