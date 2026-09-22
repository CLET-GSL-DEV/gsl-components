import { forwardRef } from "react";
import type { EmptyStateProps } from "../../types/empty-state";
import { cn } from "../../utils/cn";
import defaultIllustration from "./assets/empty-state-illustration.svg";
import "./styles/empty-state.css";

/**
 * Empty state for tables and list-like surfaces: headers stay rendered by
 * the parent, this fills the empty body with the illustration, a
 * configurable title/description, and an optional action slot.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    {
      illustration = <img src={defaultIllustration} alt="" />,
      title,
      description,
      action,
      classNames,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "clet-empty-state",
          classNames?.root,
          className,
        )}
        {...props}
      >
        {illustration ? (
          <div
            className={cn("clet-empty-state__illustration", classNames?.illustration)}
            aria-hidden
          >
            {illustration}
          </div>
        ) : null}
        <div className={cn("clet-empty-state__title", classNames?.title)}>
          {title}
        </div>
        {description ? (
          <div
            className={cn("clet-empty-state__description", classNames?.description)}
          >
            {description}
          </div>
        ) : null}
        {action ? (
          <div className={cn("clet-empty-state__action", classNames?.action)}>
            {action}
          </div>
        ) : null}
      </div>
    );
  },
);
