import { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";
import type { SelectProps, SelectOption } from "../../types/select";
import "./styles/select.css";

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      value,
      onValueChange,
      options,
      placeholder = "Select...",
      className,
      classNames,
      disabled = false,
      invalid = false,
    },
    ref,
  ) {
    return (
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            "gsl-select__trigger",
            invalid && "gsl-select__trigger--invalid",
            classNames?.trigger,
            className,
          )}
          aria-invalid={invalid || undefined}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className="gsl-select__icon">
            <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn("gsl-select__content", classNames?.content)}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="gsl-select__viewport">
              {options.map((opt: SelectOption) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "gsl-select__item",
                    value === opt.value && "gsl-select__item--selected",
                    classNames?.item,
                  )}
                >
                  <SelectPrimitive.ItemText>
                    {opt.label}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  },
);
