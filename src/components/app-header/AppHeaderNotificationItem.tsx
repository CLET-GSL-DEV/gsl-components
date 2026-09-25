import { forwardRef } from "react";
import type { AppHeaderNotificationItemProps } from "../../types/app-header";
import { cn } from "../../utils/cn";

export const AppHeaderNotificationItem = forwardRef<
  HTMLDivElement | HTMLButtonElement,
  AppHeaderNotificationItemProps
>(function AppHeaderNotificationItem(
  { text, time, unread = false, onClick, classNames, className, ...props },
  ref,
) {
  const rootClassName = cn(
    "clet-notif-popover__item gsl-notif-popover__item",
    !unread && "clet-notif-popover__item--read gsl-notif-popover__item--read",
    onClick && "clet-notif-popover__item--clickable gsl-notif-popover__item--clickable",
    classNames?.root,
    className,
  );

  const body = (
    <>
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
    </>
  );

  // A clickable row is a real <button>, not a div wearing role="button" and a
  // hand-rolled Enter/Space handler. The native element brings the role, the
  // focus order and both keys, and it cannot drift out of step with them.
  if (onClick) {
    return (
      <button
        type="button"
        ref={ref as React.Ref<HTMLButtonElement>}
        className={rootClassName}
        onClick={onClick}
        {...props}
      >
        {body}
      </button>
    );
  }

  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={rootClassName} {...props}>
      {body}
    </div>
  );
});

(
  AppHeaderNotificationItem as unknown as { componentId: string }
).componentId = "AppHeaderNotificationItem";
