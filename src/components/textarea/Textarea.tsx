import { forwardRef } from "react";
import type { TextareaProps } from "../../types/textarea";
import { cn } from "../../utils/cn";
import "./styles/textarea.css";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, classNames, className, disabled, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        "clet-textarea",
        invalid && "clet-textarea--invalid",
        disabled && "clet-textarea--disabled",
        classNames?.root,
        className,
      )}
      {...props}
    />
  );
});
