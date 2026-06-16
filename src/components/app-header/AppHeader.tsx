import { forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import "./styles/app-header.css";

export interface AppHeaderProps {
  className?: string;
  /** Search trigger (AppHeaderSearch) */
  search?: ReactNode;
  /** App switcher trigger */
  appSwitcher?: ReactNode;
  /** Notifications button (AppHeaderNotifications) */
  notifications?: ReactNode;
  /** User profile (AppHeaderProfile) */
  profile?: ReactNode;
}

export const AppHeader = forwardRef<HTMLDivElement, AppHeaderProps>(
  function AppHeader(
    { className, search, appSwitcher, notifications, profile },
    ref,
  ) {
    return (
      <div ref={ref} className={cn("gsl-app-header", className)}>
        <div className="gsl-app-header__actions">
          {search}
          <div className="gsl-app-header__right">
            {appSwitcher}
            {notifications}
            {profile}
          </div>
        </div>
      </div>
    );
  },
);

(AppHeader as any).componentId = "AppHeader";
