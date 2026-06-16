import { forwardRef, type ReactNode } from "react";
import { Bell } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../utils/cn";

export interface AppHeaderNotificationsProps {
  className?: string;
  children?: ReactNode;
}

export const AppHeaderNotifications = forwardRef<HTMLButtonElement, AppHeaderNotificationsProps>(
  function AppHeaderNotifications({ className, children }, ref) {
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
            {children}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

(AppHeaderNotifications as any).componentId = "AppHeaderNotifications";
