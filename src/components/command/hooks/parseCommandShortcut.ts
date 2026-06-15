export interface ParsedCommandShortcut {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

function isMacPlatform() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
}

export function parseCommandShortcut(shortcut: string): ParsedCommandShortcut {
  const parts = shortcut
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  const key = parts.find(
    (part) => !["mod", "ctrl", "meta", "shift", "alt"].includes(part),
  );

  if (!key) {
    throw new Error(`Invalid command shortcut: "${shortcut}"`);
  }

  const usesMod = parts.includes("mod");
  const usesMeta = parts.includes("meta");
  const usesCtrl = parts.includes("ctrl");

  return {
    key,
    metaKey: usesMeta || (usesMod && isMacPlatform()),
    ctrlKey: usesCtrl || (usesMod && !isMacPlatform()),
    shiftKey: parts.includes("shift"),
    altKey: parts.includes("alt"),
  };
}

export function matchesCommandShortcut(
  event: KeyboardEvent,
  shortcut: string,
): boolean {
  const parsed = parseCommandShortcut(shortcut);

  return (
    event.key.toLowerCase() === parsed.key &&
    event.metaKey === parsed.metaKey &&
    event.ctrlKey === parsed.ctrlKey &&
    event.shiftKey === parsed.shiftKey &&
    event.altKey === parsed.altKey
  );
}

export function formatCommandShortcutLabels(shortcut: string): string[] {
  const parts = shortcut
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  const key = parts.find(
    (part) => !["mod", "ctrl", "meta", "shift", "alt"].includes(part),
  );

  if (!key) {
    throw new Error(`Invalid command shortcut: "${shortcut}"`);
  }

  const labels: string[] = [];

  if (parts.includes("mod")) {
    labels.push(isMacPlatform() ? "⌘" : "Ctrl");
  }

  if (parts.includes("meta")) {
    labels.push("⌘");
  }

  if (parts.includes("ctrl")) {
    labels.push("Ctrl");
  }

  if (parts.includes("shift")) {
    labels.push("Shift");
  }

  if (parts.includes("alt")) {
    labels.push("Alt");
  }

  labels.push(key.length === 1 ? key.toUpperCase() : key);

  return labels;
}
