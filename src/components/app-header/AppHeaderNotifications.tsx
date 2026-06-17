import { forwardRef, type ReactNode } from "react";
import type { AppHeaderNotificationsProps } from "../../types/app-header";
import { Bell } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../utils/cn";

export const AppHeaderNotifications = forwardRef<HTMLButtonElement, AppHeaderNotificationsProps>(
  function AppHeaderNotifications({ className, children, loading, loadingLabel = "Loading notifications..." }, ref) {
    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            className={cn("gsl-app-header__notif-btn", className)}
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.5} aria-hidden />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="gsl-notif-popover"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <div className="gsl-notif-popover__header">
              <span className="gsl-notif-popover__title">Notifications</span>
            </div>
            <div className="gsl-notif-popover__body">
              {loading ? (
                <div className="gsl-notif-popover__loading">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="gsl-notif-popover__skeleton">
                      <div className="gsl-notif-popover__skeleton-dot" />
                      <div className="gsl-notif-popover__skeleton-lines">
                        <div className="gsl-notif-popover__skeleton-line" style={{ width: "85%" }} />
                        <div className="gsl-notif-popover__skeleton-line" style={{ width: "50%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                children
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

(AppHeaderNotifications as any).componentId = "AppHeaderNotifications";
