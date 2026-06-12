import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import {
  applyMask,
  deleteAtCursor,
  getCursorAfterBackspace,
  maskedIndexForSlotCount,
  stripMask,
} from "../utils/maskUtils";

interface UseInputMaskOptions {
  mask: string;
  value?: string;
  defaultValue?: string;
  onChange?: (masked: string) => void;
  onValueChange?: (unmasked: string) => void;
  disabled?: boolean;
}

export function useInputMask({
  mask,
  value,
  defaultValue = "",
  onChange,
  onValueChange,
  disabled = false,
}: UseInputMaskOptions) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    applyMask(defaultValue, mask),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const maskedValueRef = useRef("");
  const maskedValue = isControlled ? applyMask(value, mask) : internalValue;

  maskedValueRef.current = maskedValue;

  useEffect(() => {
    if (isControlled) {
      return;
    }

    setInternalValue(applyMask(defaultValue, mask));
  }, [defaultValue, isControlled, mask]);

  const emitChange = useCallback(
    (nextMasked: string) => {
      if (!isControlled) {
        setInternalValue(nextMasked);
      }

      maskedValueRef.current = nextMasked;
      onChange?.(nextMasked);
      onValueChange?.(stripMask(nextMasked, mask));
    },
    [isControlled, mask, onChange, onValueChange],
  );

  const setCursor = useCallback((index: number) => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input) {
        input.setSelectionRange(index, index);
      }
    });
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }

      const input = event.target;
      const prevMasked = maskedValueRef.current;
      const nextMasked = applyMask(input.value, mask);
      const prevRaw = stripMask(prevMasked, mask);
      const nextRaw = stripMask(nextMasked, mask);

      emitChange(nextMasked);

      if (nextRaw.length >= prevRaw.length) {
        setCursor(maskedIndexForSlotCount(nextRaw.length, mask));
      } else {
        const cursor = input.selectionStart ?? nextMasked.length;
        setCursor(Math.min(cursor, nextMasked.length));
      }
    },
    [disabled, emitChange, mask, setCursor],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || event.key !== "Backspace") {
        return;
      }

      const input = event.currentTarget;
      const cursor = input.selectionStart ?? 0;
      const selectionEnd = input.selectionEnd ?? cursor;

      if (cursor !== selectionEnd) {
        return;
      }

      if (cursor === 0) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      const currentMasked = maskedValueRef.current;
      const nextMasked = deleteAtCursor(currentMasked, cursor, mask);
      const nextCursor = getCursorAfterBackspace(currentMasked, cursor, mask);

      emitChange(nextMasked);
      setCursor(nextCursor);
    },
    [disabled, emitChange, mask, setCursor],
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }

      event.preventDefault();

      const pasted = event.clipboardData.getData("text");
      const input = event.currentTarget;
      const currentMasked = maskedValueRef.current;
      const cursor = input.selectionStart ?? currentMasked.length;
      const selectionEnd = input.selectionEnd ?? cursor;
      const before = currentMasked.slice(0, cursor);
      const after = currentMasked.slice(selectionEnd);
      const combined = `${stripMask(before, mask)}${pasted}${stripMask(after, mask)}`;
      const nextMasked = applyMask(combined, mask);

      emitChange(nextMasked);
      setCursor(maskedIndexForSlotCount(stripMask(nextMasked, mask).length, mask));
    },
    [disabled, emitChange, mask, setCursor],
  );

  return {
    inputRef,
    maskedValue,
    handleChange,
    handleKeyDown,
    handlePaste,
  };
}
