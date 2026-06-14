import { useCallback, useEffect, useState, type RefObject } from "react";
import type { FieldMappingDropdownPosition } from "./types";

export function useFieldMappingDropdownPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
): FieldMappingDropdownPosition | null {
  const [position, setPosition] = useState<FieldMappingDropdownPosition | null>(
    null,
  );

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
