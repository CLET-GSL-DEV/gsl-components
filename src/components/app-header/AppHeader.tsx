import { forwardRef, type ReactNode } from "react";
import { Bell } from "lucide-react";
import { cn } from "../../utils/cn";
import "./styles/app-header.css";

export interface AppUser {
  name: string;
  role: string;
  avatar?: string;
  initials: string;
}

export interface AppHeaderProps {
  className?: string;
  /** Logo image src */
  logoSrc?: string;
  /** Brand text next to logo */
  brandText?: string;
  /** User profile info */
  user?: AppUser;
  /** Unread notification count */
  notificationCount?: number;
  /** Search trigger button (cmd+k) */
  searchTrigger?: ReactNode;
  /** App switcher trigger */
  appSwitcherTrigger?: ReactNode;
}

export const AppHeader = forwardRef<HTMLDivElement, AppHeaderProps>(
  function AppHeader(
    {
      className,
      logoSrc,
      brandText,
      user,
      notificationCount = 0,
      searchTrigger,
      appSwitcherTrigger,
    },
    ref,
  ) {
    return (
      <div ref={ref} className={cn("gsl-app-header", className)}>
        <div className="gsl-app-header__brand">
          {logoSrc && (
            <img
              src={logoSrc}
              alt=""
              className="gsl-app-header__logo"
              width={28}
              height={28}
            />
          )}
          {brandText && (
            <span className="gsl-app-header__brand-text">{brandText}</span>
          )}
        </div>

        <div className="gsl-app-header__actions">
          {searchTrigger}

          {appSwitcherTrigger && (
            <div className="gsl-app-header__switcher">{appSwitcherTrigger}</div>
          )}

          <button
            type="button"
            className="gsl-app-header__notif-btn"
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
          >
            <Bell size={18} strokeWidth={1.5} aria-hidden />
            {notificationCount > 0 && (
              <span className="gsl-app-header__notif-badge">
                {notificationCount}
              </span>
            )}
          </button>

          {user && (
            <div className="gsl-app-header__user">
              <div className="gsl-app-header__avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="gsl-app-header__avatar-img" />
                ) : (
                  user.initials
                )}
              </div>
              <div className="gsl-app-header__user-info">
                <span className="gsl-app-header__user-name">{user.name}</span>
                <span className="gsl-app-header__user-role">{user.role}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

(AppHeader as any).componentId = "AppHeader";
