import * as Popover from "@radix-ui/react-popover";
import * as FlagIcons from "country-flag-icons/react/3x2";
import { ChevronDown } from "lucide-react";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { AsYouType, parsePhoneNumber } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import type { PhoneNumberInputProps } from "../../types/phone-number-input";
import { cn } from "../../utils/cn";
import { countries } from "../../utils/countries";
import "./styles/phone-number-input.css";

type Country = (typeof countries)[number] & { code: CountryCode };

function FlagIcon({
  code,
  label,
  className,
}: {
  code: string;
  label: string;
  className?: string;
}) {
  const Flag = FlagIcons[code as keyof typeof FlagIcons];
  if (!Flag) return null;
  return <Flag role="img" aria-label={label} className={className} />;
}

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

function formatLocal(local: string, countryCode: CountryCode): string {
  if (!local) return "";
  const f = new AsYouType(countryCode);
  return f.input(local);
}

function formatNational(fullNumber: string): string {
  try {
    const pn = parsePhoneNumber(fullNumber);
    if (pn?.isValid()) return pn.formatNational();
  } catch { /* fall through */ }
  return "";
}

function toE164(local: string, countryCode: CountryCode): string {
  if (!local) return "";
  const f = new AsYouType(countryCode);
  f.input(local);
  const e164 = f.getNumberValue();
  if (e164) return e164;
  const country = countries.find((c) => c.code === countryCode);
  return country ? country.dialCode + local : local;
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

  const [internalCountry, setInternalCountry] =
    useState<Country>(defaultCountryObj);
  const [internalRaw, setInternalRaw] = useState("");

  const country = isControlled
    ? (matchCountry(controlledValue ?? "") ?? defaultCountryObj)
    : internalCountry;

  const countryCode = country.code;

  const rawLocal = isControlled
    ? (() => {
        if (!controlledValue) return "";
        const matched = matchCountry(controlledValue);
        if (matched) return controlledValue.slice(matched.dialCode.length);
        return controlledValue;
      })()
    : internalRaw;

  const displayLocal = useMemo(() => {
    if (!rawLocal) return "";
    if (isControlled && controlledValue) {
      return formatNational(controlledValue) || formatLocal(rawLocal, countryCode);
    }
    return formatLocal(rawLocal, countryCode);
  }, [rawLocal, countryCode, isControlled, controlledValue]);

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
    (raw: string, countryCode: CountryCode) => {
      if (!isControlled) {
        setInternalRaw(raw);
      }
      const e164 = toE164(raw, countryCode);
      onChange?.(e164);
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
      emit(rawLocal, next.code);
      setOpen(false);
      setSearch("");
      inputRef.current?.focus();
    },
    [isControlled, emit, rawLocal],
  );

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      emit(raw, countryCode);
    },
    [emit, countryCode],
  );

  const handleOpenChange = (next: boolean) => {
    if (disabled) return;
    setOpen(next);
    if (!next) setSearch("");
  };

  return (
    <div
      className={cn(
        "clet-phone-number-input",
        invalid && "clet-phone-number-input--invalid",
        disabled && "clet-phone-number-input--disabled",
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
              "clet-phone-number-input__prefix",
              classNames?.prefix,
            )}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <FlagIcon
              code={country.code}
              label={`${country.name} flag`}
              className="clet-phone-number-input__flag"
            />
            <span className="clet-phone-number-input__dial">
              {country.dialCode}
            </span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={cn(
                "clet-phone-number-input__chevron",
                open && "clet-phone-number-input__chevron--open",
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={cn(
              "clet-phone-number-input__dropdown",
              classNames?.dropdown,
            )}
            side="bottom"
            align="start"
            sideOffset={4}
            role="listbox"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="clet-phone-number-input__search">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="clet-phone-number-input__search-input"
                autoFocus
              />
            </div>
            <div className="clet-phone-number-input__list">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  role="option"
                  aria-selected={country.code === c.code}
                  className={cn(
                    "clet-phone-number-input__option",
                    country.code === c.code &&
                      "clet-phone-number-input__option--selected",
                  )}
                  onClick={() => handleCountrySelect(c.code)}
                >
                  <FlagIcon
                    code={c.code}
                    label={`${c.name} flag`}
                    className="clet-phone-number-input__option-flag"
                  />
                  <span className="clet-phone-number-input__option-name">
                    {c.name}
                  </span>
                  <span className="clet-phone-number-input__option-dial">
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
        value={displayLocal}
        onChange={handleNumberChange}
        placeholder="(555) 000-0000"
        className={cn("clet-phone-number-input__input", classNames?.input)}
      />
    </div>
  );
});
