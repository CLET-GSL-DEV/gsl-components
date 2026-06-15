import { useEffect } from "react";
import { matchesCommandShortcut } from "./parseCommandShortcut";

export type { ParsedCommandShortcut } from "./parseCommandShortcut";
export { matchesCommandShortcut, parseCommandShortcut } from "./parseCommandShortcut";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName;

  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

export interface UseCommandShortcutOptions {
  shortcut?: string;
  enabled?: boolean;
}

export function useCommandShortcut(
  onToggle: () => void,
  { shortcut = "mod+k", enabled = true }: UseCommandShortcutOptions = {},
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(document.activeElement)) {
        return;
      }

      if (!matchesCommandShortcut(event, shortcut)) {
        return;
      }

      event.preventDefault();
      onToggle();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, onToggle, shortcut]);
}
