import { forwardRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import type {
  NetworkOperatorOption,
  NetworkOperatorProps,
} from "../../types/network-operator";
import { cn } from "../../utils/cn";
import "./styles/network-operator.css";

const DEFAULT_OPERATORS: NetworkOperatorOption[] = [
  {
    value: "mtn",
    label: "MTN",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg",
  },
  {
    value: "vodafone",
    label: "Vodafone",
    image: "https://img.icons8.com/fluent/1200/vodafone.jpg",
  },
  {
    value: "airteltigo",
    label: "AirtelTigo",
    image:
      "https://play-lh.googleusercontent.com/j3VSwmoKigmWqKmfMh0Z8EDLVfc8g3YJDsa1U0xk1qic5XRehqR9dEJZg_SDkgVOs2HYSqyIRcxUyJA598j-BQ",
  },
];

/**
 * @deprecated Standalone network-operator picker, superseded by the searchable
 * `Combobox` (build an operator list with `options`) — see the migration guide.
 */
export const NetworkOperator = forwardRef<HTMLDivElement, NetworkOperatorProps>(
  function NetworkOperator(
    {
      invalid = false,
      disabled = false,
      value,
      defaultValue,
      onChange,
      placeholder = "Select operator",
      options = DEFAULT_OPERATORS,
      classNames,
      className,
      ...props
    },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string | null>(defaultValue ?? null);
    const selectedValue = value !== undefined ? value : internalValue;
    const selected = options.find((o) => o.value === selectedValue) ?? null;

    const handleSelect = (optValue: string) => {
      setInternalValue(optValue);
      onChange?.(optValue);
      setOpen(false);
    };

    const handleOpenChange = (next: boolean) => {
      if (disabled) return;
      setOpen(next);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "clet-network-operator gsl-network-operator",
          invalid && "clet-network-operator--invalid gsl-network-operator--invalid",
          disabled && "clet-network-operator--disabled gsl-network-operator--disabled",
          classNames?.root,
          className,
        )}
        {...props}
      >
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "clet-network-operator__trigger gsl-network-operator__trigger",
                classNames?.trigger,
              )}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-invalid={invalid || undefined}
            >
              {selected ? (
                <>
                  {selected.image ? (
                    <img
                      src={selected.image}
                      alt=""
                      className={cn(
                        "clet-network-operator__image gsl-network-operator__image",
                        classNames?.image,
                      )}
                    />
                  ) : null}
                  <span className="clet-network-operator__label gsl-network-operator__label">
                    {selected.label}
                  </span>
                </>
              ) : (
                <span className="clet-network-operator__placeholder gsl-network-operator__placeholder">
                  {placeholder}
                </span>
              )}
              <ChevronDown size={14} strokeWidth={2} aria-hidden className="clet-network-operator__chevron gsl-network-operator__chevron" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className={cn("clet-network-operator__menu gsl-network-operator__menu", classNames?.menu)}
              side="bottom"
              align="start"
              sideOffset={4}
              role="listbox"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selectedValue === opt.value}
                  className={cn(
                    "clet-network-operator__option gsl-network-operator__option",
                    selectedValue === opt.value &&
                      "clet-network-operator__option--selected gsl-network-operator__option--selected",
                    classNames?.option,
                  )}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.image ? (
                    <img
                      src={opt.image}
                      alt=""
                      className={cn(
                        "clet-network-operator__image gsl-network-operator__image",
                        classNames?.image,
                      )}
                    />
                  ) : null}
                  <span className="clet-network-operator__option-label gsl-network-operator__option-label">
                    {opt.label}
                  </span>
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  },
);
