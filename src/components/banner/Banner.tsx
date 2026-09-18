import { forwardRef } from "react";
import { X } from "lucide-react";
import type { BannerProps } from "../../types/banner";
import { cn } from "../../utils/cn";
import "./styles/banner.css";

/**
 * Page-level banner that persists until dismissed. Full width, sits at the
 * top of a page or under a section heading. Replaces `Notice`.
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(
  function Banner(
    {
      variant = "info",
      heading,
      subtext,
      action,
      onClose,
      closeLabel = "Dismiss",
      classNames,
      className,
      role,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role={role ?? (variant === "danger" ? "alert" : "status")}
        className={cn(
          "clet-banner",
          `clet-banner--${variant}`,
          classNames?.root,
          className,
        )}
        {...props}
      >
        <div className={cn("clet-banner__accent", classNames?.accent)} aria-hidden />
        <div className={cn("clet-banner__content", classNames?.content)}>
          <div className={cn("clet-banner__heading", classNames?.heading)}>
            {heading}
          </div>
          {subtext ? (
            <div className={cn("clet-banner__subtext", classNames?.subtext)}>
              {subtext}
            </div>
          ) : null}
        </div>
        {action || onClose ? (
          <div className={cn("clet-banner__actions", classNames?.actions)}>
            {action ? (
              <div className={cn("clet-banner__action", classNames?.action)}>
                {action}
              </div>
            ) : null}
            {onClose ? (
              <button
                type="button"
                className={cn("clet-banner__close", classNames?.close)}
                aria-label={closeLabel}
                onClick={onClose}
              >
                <X size={14} strokeWidth={2.5} aria-hidden />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
