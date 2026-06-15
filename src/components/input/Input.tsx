import { forwardRef } from "react";
import type { InputProps } from "../../types/input";
import { cn } from "../../utils/cn";
import "./styles/input.css";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, classNames, className, disabled, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        "gsl-input",
        invalid && "gsl-input--invalid",
        disabled && "gsl-input--disabled",
        classNames?.root,
        className,
      )}
      {...props}
    />
  );
});
