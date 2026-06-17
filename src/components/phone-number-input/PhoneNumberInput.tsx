import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import type { PhoneNumberInputProps } from "../../types/phone-number-input";
import { cn } from "../../utils/cn";
import { countries, getFlagEmoji } from "../../utils/countries";
import "./styles/phone-number-input.css";

type Country = (typeof countries)[number];

function matchCountry(fullNumber: string): Country | null {
  if (!fullNumber) return null;
  const sorted = [...countries].sort(
    (a, b) => b.dialCode.length - a.dialCode.length,
  );
  for (const c of sorted) {
    if (fullNumber.startsWith(c.dialCode)) return c;
  }
  return null;
}

export const PhoneNumberInput = forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(function PhoneNumberInput(
  {
    invalid = false,
    disabled = false,
    classNames,
    className,
    value: controlledValue,
    onChange,
    defaultCountry = "US",
    name,
    ...props
  },
  ref,
) {
  const isControlled = controlledValue !== undefined;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultCountryObj = useMemo(
    () => countries.find((c) => c.code === defaultCountry) ?? countries[0],
    [defaultCountry],
  );

  // Internal state for uncontrolled mode
  const [internalCountry, setInternalCountry] =
    useState<Country>(defaultCountryObj);
  const [internalLocal, setInternalLocal] = useState("");

  // Derive display state
  const country = isControlled
    ? (matchCountry(controlledValue ?? "") ?? defaultCountryObj)
    : internalCountry;

  const localNumber = isControlled
    ? (() => {
        if (!controlledValue) return "";
        const matched = matchCountry(controlledValue);
        if (matched) return controlledValue.slice(matched.dialCode.length);
        return controlledValue;
      })()
    : internalLocal;

  const filtered = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q),
    );
  }, [search]);

  const emit = useCallback(
    (dialCode: string, local: string) => {
      const full = dialCode + local;
      if (!isControlled) {
        setInternalLocal(local);
      }
      onChange?.(full);
    },
    [isControlled, onChange],
  );

  const handleCountrySelect = useCallback(
    (code: string) => {
      const next = countries.find((c) => c.code === code);
      if (!next) return;

      if (!isControlled) {
        setInternalCountry(next);
      }
      // Emit full number with new country code, keeping local number
      onChange?.(next.dialCode + localNumber);
      setOpen(false);
      setSearch("");
      inputRef.current?.focus();
    },
    [isControlled, onChange, localNumber],
  );

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d\s\-()]/g, "");
      emit(country.dialCode, raw);
    },
    [emit, country.dialCode],
  );

  const handleOpenChange = (next: boolean) => {
    if (disabled) return;
    setOpen(next);
    if (!next) setSearch("");
  };

  return (
    <div
      className={cn(
        "gsl-phone-number-input",
        invalid && "gsl-phone-number-input--invalid",
        disabled && "gsl-phone-number-input--disabled",
        classNames?.root,
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    >
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "gsl-phone-number-input__prefix",
              classNames?.prefix,
            )}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="gsl-phone-number-input__flag">
              {getFlagEmoji(country.code)}
            </span>
            <span className="gsl-phone-number-input__dial">
              {country.dialCode}
            </span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={cn(
                "gsl-phone-number-input__chevron",
                open && "gsl-phone-number-input__chevron--open",
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={cn(
              "gsl-phone-number-input__dropdown",
              classNames?.dropdown,
            )}
            side="bottom"
            align="start"
            sideOffset={4}
            role="listbox"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="gsl-phone-number-input__search">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="gsl-phone-number-input__search-input"
                autoFocus
              />
            </div>
            <div className="gsl-phone-number-input__list">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  role="option"
                  aria-selected={country.code === c.code}
                  className={cn(
                    "gsl-phone-number-input__option",
                    country.code === c.code &&
                      "gsl-phone-number-input__option--selected",
                  )}
                  onClick={() => handleCountrySelect(c.code)}
                >
                  <span className="gsl-phone-number-input__option-flag">
                    {getFlagEmoji(c.code)}
                  </span>
                  <span className="gsl-phone-number-input__option-name">
                    {c.name}
                  </span>
                  <span className="gsl-phone-number-input__option-dial">
                    {c.dialCode}
                  </span>
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <input
        ref={ref}
        type="tel"
        name={name}
        disabled={disabled}
        value={localNumber}
        onChange={handleNumberChange}
        placeholder="(555) 000-0000"
        className={cn("gsl-phone-number-input__input", classNames?.input)}
      />
    </div>
  );
});
