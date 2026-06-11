import { useCallback, useEffect, useState, type RefObject } from "react";
import type { DropdownPosition } from "../../../types/dropdown";

export function useDropdownPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
): DropdownPosition | null {
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, [triggerRef]);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    updatePosition();

    const handleReposition = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePosition]);

  return position;
}
