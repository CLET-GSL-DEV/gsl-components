import { forwardRef, useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import type { CountrySelectorProps } from "../../types/country-selector";
import { cn } from "../../utils/cn";
import { countries, getFlagEmoji } from "../../utils/countries";
import "./styles/country-selector.css";

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
          "gsl-country-selector",
          invalid && "gsl-country-selector--invalid",
          disabled && "gsl-country-selector--disabled",
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
              className={cn("gsl-country-selector__trigger", classNames?.trigger)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-invalid={invalid || undefined}
            >
              {selectedCountry ? (
                <>
                  <span className={cn("gsl-country-selector__flag", classNames?.flag)}>
                    {getFlagEmoji(selectedCountry.code)}
                  </span>
                  <span className={cn("gsl-country-selector__name", classNames?.name)}>
                    {selectedCountry.name}
                  </span>
                </>
              ) : (
                <span className="gsl-country-selector__placeholder">{placeholder}</span>
              )}
              <ChevronDown size={14} strokeWidth={2} aria-hidden className="gsl-country-selector__chevron" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className={cn("gsl-country-selector__menu", classNames?.menu)}
              side="bottom"
              align="start"
              sideOffset={4}
              role="listbox"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="gsl-country-selector__search">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className={cn("gsl-country-selector__search-input", classNames?.search)}
                  autoFocus
                />
              </div>
              <div className="gsl-country-selector__list">
                {filtered.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={selectedCode === country.code}
                    className={cn(
                      "gsl-country-selector__option",
                      selectedCode === country.code && "gsl-country-selector__option--selected",
                      classNames?.option,
                    )}
                    onClick={() => handleSelect(country.code)}
                  >
                    <span className="gsl-country-selector__option-flag">
                      {getFlagEmoji(country.code)}
                    </span>
                    <span className="gsl-country-selector__option-name">{country.name}</span>
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
