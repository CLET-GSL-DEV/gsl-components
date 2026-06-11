import { useId, useRef } from "react";
import type { DropdownMenuProps } from "../../types/dropdown";
import { useDropdown } from "./hooks/useDropdown";
import "../../styles/theme.css";
import "./styles/dropdown.css";

export function DropdownMenu({
  trigger,
  items,
  ariaLabel,
  placement = "bottom-end",
  closeOnSelect = true,
  open: controlledOpen,
  onOpenChange,
  className,
  style,
}: DropdownMenuProps) {
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { open, toggle, close } = useDropdown(
    {
      open: controlledOpen,
      onOpenChange,
    },
    panelRef,
    triggerRef,
  );

  const triggerContent =
    typeof trigger === "function" ? trigger({ open }) : trigger;

  const handleItemSelect = (item: (typeof items)[number]) => {
    if (item.disabled) {
      return;
    }

    item.onSelect?.();

    if (closeOnSelect) {
      close();
    }
  };

  return (
    <div
      className={["gsl-dropdown-menu", className].filter(Boolean).join(" ")}
      style={style}
    >
      <button
        ref={triggerRef}
        type="button"
        className="gsl-dropdown-menu__trigger"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={toggle}
      >
        {triggerContent}
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          className={[
            "gsl-dropdown-menu__panel",
            `gsl-dropdown-menu__panel--${placement}`,
          ].join(" ")}
        >
          {items.map((item) => {
            const itemClassName = [
              "gsl-dropdown-menu__item",
              item.destructive ? "gsl-dropdown-menu__item--destructive" : "",
              item.disabled ? "gsl-dropdown-menu__item--disabled" : "",
            ]
              .filter(Boolean)
              .join(" ");

            if (item.href && !item.disabled) {
              return (
                <a
                  key={item.id}
                  role="menuitem"
                  href={item.href}
                  className={itemClassName}
                  onClick={() => handleItemSelect(item)}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={itemClassName}
                onClick={() => handleItemSelect(item)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
