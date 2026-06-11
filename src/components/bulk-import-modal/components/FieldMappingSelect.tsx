import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface FieldMappingSelectOption {
  value: string;
  label: string;
}

export interface FieldMappingSelectProps {
  ariaLabel: string;
  placeholder?: string;
  value: string | null;
  options: FieldMappingSelectOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string | null) => void;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

const MENU_MAX_HEIGHT = 240;
const MENU_Z_INDEX = 1200;

export function FieldMappingSelect({
  ariaLabel,
  placeholder = "Select column...",
  value,
  options,
  open,
  onOpenChange,
  onChange,
}: FieldMappingSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;
  const isPlaceholder = !selectedOption;

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();

    const handleReposition = () => {
      updateMenuPosition();
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) {
        return;
      }

      const menu = document.getElementById(listboxId);
      if (menu?.contains(target)) {
        return;
      }

      onOpenChange(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [listboxId, onOpenChange, open]);

  const handleSelect = (nextValue: string | null) => {
    onChange(nextValue);
    onOpenChange(false);
  };

  const menu =
    open && menuPosition
      ? createPortal(
          <ul
            id={listboxId}
            role="listbox"
            className="gsl-bulk-import__field-select-menu"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              maxHeight: MENU_MAX_HEIGHT,
              zIndex: MENU_Z_INDEX,
            }}
          >
            <li
              role="option"
              aria-selected={value === null}
              className={[
                "gsl-bulk-import__field-select-option",
                value === null
                  ? "gsl-bulk-import__field-select-option--selected"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(null)}
            >
              {placeholder}
            </li>
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                className={[
                  "gsl-bulk-import__field-select-option",
                  value === option.value
                    ? "gsl-bulk-import__field-select-option--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="gsl-bulk-import__field-select">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        className={[
          "gsl-bulk-import__field-select-trigger",
          isPlaceholder ? "gsl-bulk-import__field-select-trigger--placeholder" : "",
          open ? "gsl-bulk-import__field-select-trigger--open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => onOpenChange(!open)}
      >
        <span className="gsl-bulk-import__field-select-trigger-label">
          {displayLabel}
        </span>
      </button>
      {menu}
    </div>
  );
}
