import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import type { ComboboxProps, DropdownOption } from "../../types/dropdown";
import { useComboboxSearch } from "./hooks/useComboboxSearch";
import { useDropdown } from "./hooks/useDropdown";
import { useDropdownPosition } from "./hooks/useDropdownPosition";
import "../../styles/theme.css";
import "./styles/dropdown.css";

const MENU_MAX_HEIGHT = 240;
const MENU_Z_INDEX = 1200;

export function Combobox({
  ariaLabel,
  placeholder = "Search...",
  value,
  loadOptions,
  debounceMs = 300,
  minSearchLength = 0,
  getOptionLabel,
  noResultsText = "No results",
  loadingText = "Loading...",
  clearable = false,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  onChange,
  className,
  style,
}: ComboboxProps) {
  const listboxId = useId();
  const controlRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const skipNextFocusQuery = useRef(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    null,
  );

  const { open, setOpen, close } = useDropdown(
    {
      open: controlledOpen,
      onOpenChange,
    },
    panelRef,
    controlRef,
  );

  const { query, setQuery, options, loading, error } = useComboboxSearch({
    loadOptions,
    debounceMs,
    minSearchLength,
    enabled: open,
  });

  const menuPosition = useDropdownPosition(open, controlRef);

  const getSelectedLabel = useCallback(() => {
    if (selectedOption && selectedOption.value === value) {
      return selectedOption.label;
    }

    if (value && getOptionLabel) {
      return getOptionLabel(value) ?? "";
    }

    return selectedOption?.label ?? "";
  }, [getOptionLabel, selectedOption, value]);

  useEffect(() => {
    if (value === null) {
      setSelectedOption(null);
    }
  }, [value]);

  useEffect(() => {
    if (!open) {
      setQuery(getSelectedLabel());
    }
  }, [open, getSelectedLabel, setQuery]);

  const handleFocus = () => {
    if (disabled) {
      return;
    }

    setOpen(true);

    if (skipNextFocusQuery.current) {
      skipNextFocusQuery.current = false;
      return;
    }

    setQuery(getSelectedLabel());
    window.requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOpen(true);
    setQuery(event.target.value);
  };

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) {
      return;
    }

    setSelectedOption(option);
    onChange(option.value);
    setQuery(option.label);
    close();
    inputRef.current?.blur();
  };

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedOption(null);
    onChange(null);
    setQuery("");
    setOpen(true);
    skipNextFocusQuery.current = true;
    inputRef.current?.focus();
  };

  const inputValue = open ? query : value ? getSelectedLabel() : "";
  const showClear = clearable && value !== null && !disabled;

  const menu =
    open && menuPosition
      ? createPortal(
          <ul
            ref={panelRef}
            id={listboxId}
            role="listbox"
            className="gsl-dropdown__menu"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              maxHeight: MENU_MAX_HEIGHT,
              zIndex: MENU_Z_INDEX,
            }}
          >
            {loading ? (
              <li
                className="gsl-combobox__status gsl-combobox__status--loading"
                role="presentation"
              >
                <span
                  role="status"
                  aria-label={loadingText}
                  className="gsl-combobox__spinner"
                />
              </li>
            ) : null}
            {error ? (
              <li className="gsl-combobox__status gsl-combobox__status--error" role="presentation">
                {error}
              </li>
            ) : null}
            {!loading && !error && options.length === 0 ? (
              <li className="gsl-combobox__status" role="presentation">
                {noResultsText}
              </li>
            ) : null}
            {!loading && !error
              ? options.map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={value === option.value}
                    aria-disabled={option.disabled}
                    className={[
                      "gsl-dropdown__option",
                      value === option.value
                        ? "gsl-dropdown__option--selected"
                        : "",
                      option.disabled ? "gsl-dropdown__option--disabled" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </li>
                ))
              : null}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      className={["gsl-combobox", className].filter(Boolean).join(" ")}
      style={style}
    >
      <div
        ref={controlRef}
        className={[
          "gsl-combobox__control",
          open ? "gsl-combobox__control--open" : "",
          showClear ? "gsl-combobox__control--clearable" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          className={[
            "gsl-combobox__input",
            open ? "gsl-combobox__input--open" : "",
            !open && !value ? "gsl-combobox__input--placeholder" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-busy={loading}
          onFocus={handleFocus}
          onChange={handleInputChange}
        />
        {showClear ? (
          <button
            type="button"
            className="gsl-combobox__clear"
            aria-label="Clear selection"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
          >
            ×
          </button>
        ) : null}
      </div>
      {menu}
    </div>
  );
}
