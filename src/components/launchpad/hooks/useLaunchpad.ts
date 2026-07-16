import { useCallback, useRef, useState } from "react";
import type {
  UseLaunchpadOptions,
  UseLaunchpadReturn,
} from "../../../types/launchpad";

export function useLaunchpad(
  options: UseLaunchpadOptions = {},
): UseLaunchpadReturn {
  const { open: controlledOpen, onOpenChange } = options;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  return {
    open,
    setOpen,
    toggle,
    close,
    triggerRef,
    panelRef,
  };
}
