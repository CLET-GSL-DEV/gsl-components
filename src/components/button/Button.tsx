import { forwardRef } from "react";
import type { ButtonProps } from "../../types/button";
import { cn } from "../../utils/cn";
import { Spinner } from "./Spinner";
import "./styles/button.css";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
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
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "clet-button gsl-button",
          `clet-button--${variant} gsl-button--${variant}`,
          `clet-button--${size} gsl-button--${size}`,
          loading && "clet-button--loading gsl-button--loading",
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
            <span className="clet-button__sr-only gsl-button__sr-only">{loadingLabel}</span>
          </>
        ) : null}
        <span
          className={cn("clet-button__label gsl-button__label", classNames?.label)}
          aria-hidden={loading || undefined}
        >
          {children}
        </span>
      </button>
    );
  },
);
