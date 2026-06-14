import type { ButtonProps } from "../../types/button";
import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";
import "./styles/button.css";

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  loadingLabel = "Loading",
  disabled,
  className,
  classNames,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cn(
        "gsl-button",
        `gsl-button--${variant}`,
        `gsl-button--${size}`,
        loading && "gsl-button--loading",
        classNames?.root,
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size} className={classNames?.spinner} />
          <span className="gsl-button__sr-only">{loadingLabel}</span>
        </>
      ) : null}
      <span
        className={cn("gsl-button__label", classNames?.label)}
        aria-hidden={loading || undefined}
      >
        {children}
      </span>
    </button>
  );
}
