export type MaskSlotType = "digit" | "letter" | "alphanumeric" | "literal";

export interface MaskSlot {
  type: MaskSlotType;
  char?: string;
}

const DIGIT_PATTERN = /\d/;
const LETTER_PATTERN = /[a-zA-Z]/;
const ALPHANUMERIC_PATTERN = /[a-zA-Z0-9]/;

export function parseMask(mask: string): MaskSlot[] {
  return [...mask].map((char) => {
    if (char === "#") {
      return { type: "digit" as const };
    }

    if (char === "A") {
      return { type: "letter" as const };
    }

    if (char === "*") {
      return { type: "alphanumeric" as const };
    }

    return { type: "literal" as const, char };
  });
}

function countInputSlots(slots: MaskSlot[]): number {
  return slots.filter((slot) => slot.type !== "literal").length;
}

function matchesSlot(char: string, slot: MaskSlot): boolean {
  if (slot.type === "digit") {
    return DIGIT_PATTERN.test(char);
  }

  if (slot.type === "letter") {
    return LETTER_PATTERN.test(char);
  }

  if (slot.type === "alphanumeric") {
    return ALPHANUMERIC_PATTERN.test(char);
  }

  return false;
}

function maskInput(input: string, mask: string): { masked: string; raw: string } {
  const slots = parseMask(mask);
  const maxRawLength = countInputSlots(slots);
  let raw = "";
  let slotIndex = 0;
  let masked = "";

  for (const char of input) {
    if (
      slotIndex < slots.length &&
      slots[slotIndex].type === "literal" &&
      slots[slotIndex].char === char
    ) {
      masked += slots[slotIndex].char ?? "";
      slotIndex += 1;
      continue;
    }

    while (slotIndex < slots.length && slots[slotIndex].type === "literal") {
      masked += slots[slotIndex].char ?? "";
      slotIndex += 1;
    }

    if (slotIndex >= slots.length || raw.length >= maxRawLength) {
      break;
    }

    const slot = slots[slotIndex];

    if (matchesSlot(char, slot)) {
      masked += char;
      raw += char;
      slotIndex += 1;
    }
  }

  return { masked, raw };
}

export function applyMask(rawInput: string, mask: string): string {
  return maskInput(rawInput, mask).masked;
}

export function stripMask(masked: string, mask: string): string {
  const slots = parseMask(mask);
  let raw = "";
  let slotIndex = 0;

  for (const char of masked) {
    while (slotIndex < slots.length && slots[slotIndex].type === "literal") {
      slotIndex += 1;
    }

    if (slotIndex >= slots.length) {
      break;
    }

    const slot = slots[slotIndex];

    if (matchesSlot(char, slot)) {
      raw += char;
      slotIndex += 1;
    }
  }

  return raw;
}

function countFilledSlots(masked: string, mask: string): number {
  return stripMask(masked, mask).length;
}

export function maskedIndexForSlotCount(slotCount: number, mask: string): number {
  const slots = parseMask(mask);
  let filled = 0;
  let index = 0;

  for (const slot of slots) {
    if (slot.type === "literal") {
      if (filled < slotCount) {
        index += 1;
      }
      continue;
    }

    if (filled >= slotCount) {
      break;
    }

    filled += 1;
    index += 1;
  }

  return index;
}

export function getCursorAfterEdit(
  prevMasked: string,
  nextMasked: string,
  prevCursor: number,
  mask: string,
): number {
  const prevCount = countFilledSlots(prevMasked.slice(0, prevCursor), mask);
  const nextCount = countFilledSlots(nextMasked, mask);

  if (nextCount === 0) {
    return nextMasked.length;
  }

  const targetCount =
    nextCount > prevCount
      ? countFilledSlots(nextMasked.slice(0, prevCursor + 1), mask)
      : Math.min(prevCount, nextCount);

  return maskedIndexForSlotCount(
    Math.max(targetCount, nextCount > prevCount ? nextCount : targetCount),
    mask,
  );
}

export function getCursorAfterBackspace(masked: string, cursor: number, mask: string): number {
  const nextMasked = deleteAtCursor(masked, cursor, mask);
  return maskedIndexForSlotCount(stripMask(nextMasked, mask).length, mask);
}

export function deleteAtCursor(masked: string, cursor: number, mask: string): string {
  let deleteCursor = cursor;

  while (deleteCursor > 0) {
    const beforeCursor = masked.slice(0, deleteCursor);
    const rawBefore = stripMask(beforeCursor, mask);

    if (rawBefore.length > 0) {
      return applyMask(rawBefore.slice(0, -1), mask);
    }

    deleteCursor -= 1;
  }

  return "";
}
