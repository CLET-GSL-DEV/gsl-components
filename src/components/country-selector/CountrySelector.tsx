import { forwardRef, useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import type { CountrySelectorProps } from "../../types/country-selector";
import { cn } from "../../utils/cn";
import { countries, getFlagEmoji } from "../../utils/countries";
import "./styles/country-selector.css";

/**
 * @deprecated Standalone country/dial-code picker, superseded by the searchable
 * `Combobox` (build a country list with `options`) for general country selection,
 * or `PhoneNumberInput`'s own built-in country picker for phone-number use cases —
 * see the [migration guide](/docs/migration-v2). Kept exported and fully working;
 * it receives no further features or design updates.
 */
export const CountrySelector = forwardRef<HTMLDivElement, CountrySelectorProps>(
  function CountrySelector(
    {
      invalid = false,
      disabled = false,
      value,
      defaultValue = "GH",
      onChange,
      placeholder = "Select country",
      classNames,
      className,
      ...props
    },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [internalValue, setInternalValue] = useState(defaultValue);
    const selectedCode = value !== undefined ? value : internalValue;

    const selectedCountry = useMemo(
      () => countries.find((c) => c.code === selectedCode) ?? null,
      [selectedCode],
    );

    const filtered = useMemo(() => {
      if (!search) return countries;
      const q = search.toLowerCase();
      return countries.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q),
      );
    }, [search]);

    const handleSelect = (code: string) => {
      setInternalValue(code);
      onChange?.(code);
      setOpen(false);
      setSearch("");
    };

    const handleOpenChange = (next: boolean) => {
      if (disabled) return;
      setOpen(next);
      if (!next) setSearch("");
    };

    return (
      <div
        ref={ref}
        className={cn(
          "clet-country-selector gsl-country-selector",
          invalid && "clet-country-selector--invalid gsl-country-selector--invalid",
          disabled && "clet-country-selector--disabled gsl-country-selector--disabled",
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
              className={cn("clet-country-selector__trigger gsl-country-selector__trigger", classNames?.trigger)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-invalid={invalid || undefined}
            >
              {selectedCountry ? (
                <>
                  <span className={cn("clet-country-selector__flag gsl-country-selector__flag", classNames?.flag)}>
                    {getFlagEmoji(selectedCountry.code)}
                  </span>
                  <span className={cn("clet-country-selector__name gsl-country-selector__name", classNames?.name)}>
                    {selectedCountry.name}
                  </span>
                </>
              ) : (
                <span className="clet-country-selector__placeholder gsl-country-selector__placeholder">{placeholder}</span>
              )}
              <ChevronDown size={14} strokeWidth={2} aria-hidden className="clet-country-selector__chevron gsl-country-selector__chevron" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className={cn("clet-country-selector__menu gsl-country-selector__menu", classNames?.menu)}
              side="bottom"
              align="start"
              sideOffset={4}
              role="listbox"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="clet-country-selector__search gsl-country-selector__search">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className={cn("clet-country-selector__search-input gsl-country-selector__search-input", classNames?.search)}
                  autoFocus
                />
              </div>
              <div className="clet-country-selector__list gsl-country-selector__list">
                {filtered.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={selectedCode === country.code}
                    className={cn(
                      "clet-country-selector__option gsl-country-selector__option",
                      selectedCode === country.code && "clet-country-selector__option--selected gsl-country-selector__option--selected",
                      classNames?.option,
                    )}
                    onClick={() => handleSelect(country.code)}
                  >
                    <span className="clet-country-selector__option-flag gsl-country-selector__option-flag">
                      {getFlagEmoji(country.code)}
                    </span>
                    <span className="clet-country-selector__option-name gsl-country-selector__option-name">{country.name}</span>
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  },
);
