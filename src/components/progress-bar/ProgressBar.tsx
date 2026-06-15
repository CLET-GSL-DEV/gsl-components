import { forwardRef } from "react";
import type { ProgressBarProps } from "../../types/progress-bar";
import { cn } from "../../utils/cn";
import "./styles/progress-bar.css";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    {
      value = 0,
      max = 100,
      variant = "default",
      size = "sm",
      indeterminate = false,
      label,
      showValue = false,
      className,
      classNames,
      "aria-label": ariaLabelProp,
      ...props
    },
    ref,
  ) {
    const safeMax = max > 0 ? max : 100;
    const clampedValue = clamp(value, 0, safeMax);
    const percent = Math.round((clampedValue / safeMax) * 100);
    const ariaLabel = ariaLabelProp ?? label;

    return (
      <div
        ref={ref}
        role="progressbar"
        className={cn(
          "gsl-progress-bar",
          `gsl-progress-bar--${variant}`,
          `gsl-progress-bar--${size}`,
          indeterminate && "gsl-progress-bar--indeterminate",
          showValue && "gsl-progress-bar--with-value",
          classNames?.root,
          className,
        )}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : clampedValue}
        {...props}
      >
        <div className="gsl-progress-bar__track">
          <div
            className={cn(
              "gsl-progress-bar__indicator",
              classNames?.indicator,
            )}
            style={
              indeterminate ? undefined : { width: `${percent}%` }
            }
          />
        </div>
        {showValue ? (
          <span
            className={cn("gsl-progress-bar__value", classNames?.value)}
            aria-hidden="true"
          >
            {percent}%
          </span>
        ) : null}
      </div>
    );
  },
);
