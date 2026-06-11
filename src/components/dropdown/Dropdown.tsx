import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { DropdownProps } from "../../types/dropdown";
import { useDropdown } from "./hooks/useDropdown";
import { useDropdownPosition } from "./hooks/useDropdownPosition";
import "../../styles/theme.css";
import "./styles/dropdown.css";

const MENU_MAX_HEIGHT = 240;
const MENU_Z_INDEX = 1200;

export function Dropdown({
  ariaLabel,
  placeholder = "Select...",
  value,
  options,
  clearable = false,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  onChange,
  className,
  style,
}: DropdownProps) {
  const listboxId = useId();
  const panelRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { open, toggle, close } = useDropdown(
    {
      open: controlledOpen,
      onOpenChange,
    },
    panelRef,
    triggerRef,
  );

  const menuPosition = useDropdownPosition(open, triggerRef);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;
  const isPlaceholder = !selectedOption;

  const handleSelect = (nextValue: string | null) => {
    onChange(nextValue);
    close();
  };

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
            {clearable ? (
              <li
                role="option"
                aria-selected={value === null}
                className={[
                  "gsl-dropdown__option",
                  value === null ? "gsl-dropdown__option--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(null)}
              >
                {placeholder}
              </li>
            ) : null}
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                aria-disabled={option.disabled}
                className={[
                  "gsl-dropdown__option",
                  value === option.value ? "gsl-dropdown__option--selected" : "",
                  option.disabled ? "gsl-dropdown__option--disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (!option.disabled) {
                    handleSelect(option.value);
                  }
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      className={["gsl-dropdown", className].filter(Boolean).join(" ")}
      style={style}
    >
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        disabled={disabled}
        className={[
          "gsl-dropdown__trigger",
          isPlaceholder ? "gsl-dropdown__trigger--placeholder" : "",
          open ? "gsl-dropdown__trigger--open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => {
          if (!disabled) {
            toggle();
          }
        }}
      >
        <span className="gsl-dropdown__trigger-label">{displayLabel}</span>
      </button>
      {menu}
    </div>
  );
}
