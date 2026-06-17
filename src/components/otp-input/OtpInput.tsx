import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { OtpInputProps } from "../../types/otp-input";
import { cn } from "../../utils/cn";
import "./styles/otp-input.css";

export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  function OtpInput(
    {
      invalid = false,
      disabled = false,
      classNames,
      className,
      length = 6,
      value: controlledValue,
      onChange,
      onComplete,
      onBlur,
      id,
      name,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedby,
      ...props
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState<string[]>(
      Array(length).fill(""),
    );
    const value =
      controlledValue !== undefined
        ? (controlledValue + "").padEnd(length, "").slice(0, length).split("")
        : internalValue;

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(
      ref,
      () => inputRefs.current[0] as HTMLInputElement,
      [],
    );

    const setValue = useCallback(
      (newDigits: string[]) => {
        if (controlledValue === undefined) {
          setInternalValue(newDigits);
        }
        const joined = newDigits.join("");
        onChange?.(joined);
        if (joined.length === length) {
          onComplete?.(joined);
        }
      },
      [controlledValue, onChange, onComplete, length],
    );

    const handleChange = useCallback(
      (index: number, char: string) => {
        if (disabled) return;
        if (char.length > 1) return;

        const digit = char.replace(/[^0-9a-zA-Z]/g, "").slice(0, 1);
        if (!digit && char) return;

        const newDigits = [...value];
        if (digit) {
          newDigits[index] = digit;
          setValue(newDigits);
          if (index < length - 1) {
            inputRefs.current[index + 1]?.focus();
          }
        }
      },
      [disabled, value, length, setValue],
    );

    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (e.key === "Backspace") {
          e.preventDefault();
          const newDigits = [...value];
          if (newDigits[index]) {
            newDigits[index] = "";
            setValue(newDigits);
          } else if (index > 0) {
            newDigits[index - 1] = "";
            setValue(newDigits);
            inputRefs.current[index - 1]?.focus();
          }
        }

        if (e.key === "ArrowLeft" && index > 0) {
          e.preventDefault();
          inputRefs.current[index - 1]?.focus();
        }

        if (e.key === "ArrowRight" && index < length - 1) {
          e.preventDefault();
          inputRefs.current[index + 1]?.focus();
        }
      },
      [disabled, value, length, setValue],
    );

    const handlePaste = useCallback(
      (index: number, e: React.ClipboardEvent) => {
        e.preventDefault();
        if (disabled) return;

        const pasted = e.clipboardData
          .getData("text")
          .replace(/[^0-9a-zA-Z]/g, "")
          .slice(0, length - index);

        const newDigits = [...value];
        for (let i = 0; i < pasted.length; i++) {
          newDigits[index + i] = pasted[i];
        }
        setValue(newDigits);

        const focusIndex = Math.min(index + pasted.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
      },
      [disabled, value, length, setValue],
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const handleContainerBlur = useCallback(
      (e: React.FocusEvent) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          onBlur?.(e as unknown as React.FocusEvent<HTMLInputElement>);
        }
      },
      [onBlur],
    );

    const invalidBool = ariaInvalid !== undefined ? !!ariaInvalid : invalid;

    return (
      <div
        ref={containerRef}
        id={id}
        role="group"
        aria-invalid={invalidBool || undefined}
        aria-describedby={ariaDescribedby}
        className={cn(
          "gsl-otp-input",
          invalidBool && "gsl-otp-input--invalid",
          disabled && "gsl-otp-input--disabled",
          classNames?.root,
          className,
        )}
        onBlur={handleContainerBlur}
        {...props}
      >
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            name={i === 0 ? name : undefined}
            disabled={disabled}
            aria-invalid={invalidBool || undefined}
            maxLength={1}
            value={value[i] || ""}
            className={cn(
              "gsl-input",
              "gsl-otp-input__slot",
              invalidBool && "gsl-input--invalid",
              disabled && "gsl-input--disabled",
              classNames?.slot,
            )}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
    );
  },
);
