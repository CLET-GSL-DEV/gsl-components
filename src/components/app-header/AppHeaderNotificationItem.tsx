import { forwardRef } from "react";
import type { AppHeaderNotificationItemProps } from "../../types/app-header";
import { cn } from "../../utils/cn";

export const AppHeaderNotificationItem = forwardRef<
  HTMLDivElement,
  AppHeaderNotificationItemProps
>(function AppHeaderNotificationItem(
  { text, time, unread = false, onClick, classNames, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "clet-notif-popover__item gsl-notif-popover__item",
        !unread && "clet-notif-popover__item--read gsl-notif-popover__item--read",
        classNames?.root,
        className,
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      {...props}
    >
      {unread ? (
        <div className={cn("clet-notif-popover__dot gsl-notif-popover__dot", classNames?.dot)} aria-hidden />
      ) : null}
      <div className={cn("clet-notif-popover__item-body gsl-notif-popover__item-body", classNames?.body)}>
        <div className={cn("clet-notif-popover__body-text gsl-notif-popover__body-text", classNames?.text)}>
          {text}
        </div>
        {time ? (
          <div className={cn("clet-notif-popover__body-time gsl-notif-popover__body-time", classNames?.time)}>
            {time}
          </div>
        ) : null}
      </div>
    </div>
  );
});

(
  AppHeaderNotificationItem as unknown as { componentId: string }
).componentId = "AppHeaderNotificationItem";
