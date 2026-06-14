import type { ButtonSize } from "../../types/button";
import { cn } from "../../utils/cn";

interface SpinnerProps {
  size?: ButtonSize;
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      className={cn("gsl-button__spinner", `gsl-button__spinner--${size}`, className)}
      aria-hidden="true"
    />
  );
}
