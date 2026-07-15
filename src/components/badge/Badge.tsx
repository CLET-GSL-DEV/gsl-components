import { forwardRef } from "react";
import type { BadgeProps } from "../../types/badge";
import { cn } from "../../utils/cn";
import "./styles/badge.css";

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = "default",
    size = "sm",
    className,
    classNames,
    children,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        "clet-badge",
        `clet-badge--${variant}`,
        `clet-badge--${size}`,
        classNames?.root,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
});
