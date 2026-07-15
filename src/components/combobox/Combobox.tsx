import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command as CommandPrimitive } from "cmdk";
import { Check, ChevronDown, Search, XCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { ComboboxProps } from "../../types/combobox";
import { cn } from "../../utils/cn";
import "./styles/combobox.css";

export function Combobox(props: ComboboxProps) {
  const {
    options,
    multiple = false,
    value,
    onValueChange,
    placeholder = "Select",
    searchPlaceholder = "Search...",
    disabled = false,
    invalid = false,
    clearable = false,
    emptyMessage = "No results",
    "aria-label": ariaLabel,
    classNames,
    className,
    name,
  } = props;

  const [open, setOpen] = useState(false);

  const selectedValues = useMemo<string[]>(
    () => (multiple ? (value as string[]) : value ? [value as string] : []),
    [multiple, value],
  );

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.includes(option.value)),
    [options, selectedValues],
  );

  const hasValue = selectedValues.length > 0;

  const triggerLabel = useMemo(() => {
    if (multiple) {
      return hasValue
        ? `Selected: ${selectedOptions.length} option${selectedOptions.length === 1 ? "" : "s"}`
        : placeholder;
    }
    return selectedOptions[0]?.label ?? placeholder;
  }, [multiple, hasValue, selectedOptions, placeholder]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (multiple) {
        const current = value as string[];
        const next = current.includes(optionValue)
          ? current.filter((v) => v !== optionValue)
          : [...current, optionValue];
        (onValueChange as (v: string[]) => void)(next);
      } else {
        (onValueChange as (v: string | null) => void)(optionValue);
        setOpen(false);
      }
    },
    [multiple, value, onValueChange],
  );

  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (multiple) {
        (onValueChange as (v: string[]) => void)([]);
      } else {
        (onValueChange as (v: string | null) => void)(null);
      }
    },
    [multiple, onValueChange],
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <span className={cn("clet-combobox", classNames?.root, className)}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-invalid={invalid || undefined}
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn(
              "clet-combobox__trigger",
              invalid && "clet-combobox__trigger--invalid",
              classNames?.trigger,
            )}
          >
            <span
              className={cn(
                "clet-combobox__trigger-text",
                !hasValue && "clet-combobox__trigger-text--placeholder",
              )}
            >
              {triggerLabel}
            </span>
            {clearable && hasValue ? (
              <XCircle
                className="clet-combobox__clear"
                size={16}
                aria-label="Clear selection"
                role="button"
                tabIndex={0}
                onClick={handleClear}
              />
            ) : null}
            <ChevronDown
              className="clet-combobox__chevron"
              size={16}
              aria-hidden
              data-state={open ? "open" : "closed"}
            />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className={cn("clet-combobox__content", classNames?.content)}
            sideOffset={4}
            align="start"
          >
            <CommandPrimitive className="clet-combobox__command">
              <div className="clet-combobox__input-wrapper">
                <Search
                  className="clet-combobox__input-icon"
                  size={16}
                  aria-hidden
                />
                <CommandPrimitive.Input
                  className={cn("clet-combobox__input", classNames?.input)}
                  placeholder={searchPlaceholder}
                />
              </div>
              <CommandPrimitive.List
                className={cn("clet-combobox__list", classNames?.list)}
              >
                <CommandPrimitive.Empty
                  className={cn("clet-combobox__empty", classNames?.empty)}
                >
                  {emptyMessage}
                </CommandPrimitive.Empty>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandPrimitive.Item
                      key={option.value}
                      value={option.value}
                      keywords={[option.label]}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option.value)}
                      className={cn("clet-combobox__item", classNames?.item)}
                    >
                      {option.icon ? (
                        <span
                          className={cn(
                            "clet-combobox__item-icon",
                            classNames?.itemIcon,
                          )}
                        >
                          {option.icon}
                        </span>
                      ) : null}
                      <span className="clet-combobox__item-label">
                        {option.label}
                      </span>
                      {multiple ? (
                        <span
                          className={cn(
                            "clet-combobox__item-check",
                            isSelected && "clet-combobox__item-check--checked",
                            classNames?.itemCheck,
                          )}
                          aria-hidden
                        >
                          {isSelected ? (
                            <Check size={12} strokeWidth={3} />
                          ) : null}
                        </span>
                      ) : isSelected ? (
                        <Check
                          className={cn(
                            "clet-combobox__item-check-single",
                            classNames?.itemCheck,
                          )}
                          size={16}
                          aria-hidden
                        />
                      ) : null}
                    </CommandPrimitive.Item>
                  );
                })}
              </CommandPrimitive.List>
            </CommandPrimitive>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </span>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={multiple ? (value as string[]).join(",") : (value as string | null) ?? ""}
          readOnly
        />
      ) : null}
    </PopoverPrimitive.Root>
  );
}
