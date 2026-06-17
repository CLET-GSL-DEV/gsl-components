import { forwardRef, type ReactNode } from "react";
import type { AppHeaderProfileProps, AppUser } from "../../types/app-header";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../utils/cn";
import { ChevronDown } from "lucide-react";

export const AppHeaderProfile = forwardRef<
  HTMLDivElement,
  AppHeaderProfileProps
>(function AppHeaderProfile({ user, children, className }, ref) {
  const letter = (user.initials ?? user.name).trim().charAt(0).toUpperCase() || "?";
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div ref={ref} className={cn("gsl-app-header__profile", className)}>
          <div className="gsl-app-header__avatar">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="gsl-app-header__avatar-img"
              />
            ) : (
              user.initials
            )}
          </div>
          <div className="gsl-app-header__user-info">
            <span className="gsl-app-header__user-name">{user.name}</span>
            <span className="gsl-app-header__user-role">{user.role}</span>
          </div>
          <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="gsl-profile-popover"
          side="bottom"
          align="end"
          sideOffset={8}
          role="menu"
        >
          <div className="gsl-profile-popover__header">
            <div className="gsl-profile-popover__avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="gsl-profile-popover__avatar-img" />
              ) : (
                <span className="gsl-profile-popover__avatar-letter">{letter}</span>
              )}
            </div>
            <span className="gsl-profile-popover__name">{user.name}</span>
            {user.email && (
              <span className="gsl-profile-popover__email">{user.email}</span>
            )}
          </div>
          {children && (
            <div className="gsl-profile-popover__actions">{children}</div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});

(AppHeaderProfile as any).componentId = "AppHeaderProfile";
