import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { UseDropdownOptions, UseDropdownReturn } from "../../../types/dropdown";

export function useDropdown<
  T extends HTMLElement = HTMLElement,
  U extends HTMLElement = HTMLElement,
>(
  options: UseDropdownOptions = {},
  panelRefProp?: RefObject<T | null>,
  triggerRefProp?: RefObject<U | null>,
): UseDropdownReturn<T, U> {
  const { open: controlledOpen, onOpenChange } = options;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const internalTriggerRef = useRef<U>(null);
  const triggerRef = triggerRefProp ?? internalTriggerRef;
  const internalPanelRef = useRef<T | null>(null);
  const panelRef = panelRefProp ?? internalPanelRef;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  return {
    open,
    setOpen,
    toggle,
    close,
    triggerRef,
    panelRef,
  };
}
