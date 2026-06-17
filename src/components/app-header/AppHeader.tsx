import { forwardRef, type ReactNode } from "react";
import type { AppHeaderProps } from "../../types/app-header";
import { cn } from "../../utils/cn";
import "./styles/app-header.css";

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
