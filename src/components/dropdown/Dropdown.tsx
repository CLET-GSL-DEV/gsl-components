import { useCallback, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../popover/Popover";
import type { DropdownProps } from "../../types/dropdown";
import { cn } from "../../utils/cn";
import "./styles/dropdown.css";

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
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const isPlaceholder = !selectedOption;

  const handleSelect = useCallback(
    (optionValue: string | null) => {
      onValueChange(optionValue);
      setOpen(false);
    },
    [onValueChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, optionValue: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect(optionValue);
      }
    },
    [handleSelect],
  );

  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("gsl-dropdown", classNames?.root, className)}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            className={cn(
              "gsl-dropdown__trigger",
              isPlaceholder && "gsl-dropdown__trigger--placeholder",
              invalid && "gsl-dropdown__trigger--invalid",
              classNames?.trigger,
            )}
            aria-label={ariaLabel}
            aria-invalid={invalid || undefined}
            aria-expanded={open}
            disabled={disabled}
          >
            <span className="gsl-dropdown__value">
              {formatOption
                ? formatOption(
                    selectedOption ?? null,
                    isPlaceholder ? "empty" : "selected",
                  )
                : (selectedOption?.label ?? placeholder)}
            </span>
            <span className={cn("gsl-dropdown__trigger-icon", classNames?.icon)} aria-hidden="true">
              <ChevronDown size={16} strokeWidth={2} aria-hidden />
            </span>
          </button>
        </PopoverTrigger>
      </div>

      <PopoverContent
        align="start"
        sideOffset={4}
        className={cn("gsl-popover--menu", "gsl-dropdown__menu", classNames?.menu)}
        role="listbox"
        aria-label={ariaLabel}
        style={{
          minWidth: triggerRef.current?.offsetWidth ?? 0,
          zIndex: "var(--gsl-z-select)",
        }}
      >
        <div className="gsl-popover__menu">
          {clearable && value !== null && (
            <button
              type="button"
              className={cn("gsl-popover__menu-item", classNames?.option)}
              role="option"
              onClick={() => handleSelect(null)}
              onKeyDown={(e) => handleKeyDown(e, "")}
            >
              {placeholder}
            </button>
          )}
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "gsl-popover__menu-item",
                value === option.value && "gsl-popover__menu-item--active",
                option.disabled && "gsl-popover__menu-item--disabled",
                classNames?.option,
              )}
              role="option"
              aria-selected={value === option.value}
              disabled={option.disabled}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
            >
              {formatOption
                ? formatOption(
                    option,
                    option.value === value ? "selected" : "idle",
                  )
                : option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
