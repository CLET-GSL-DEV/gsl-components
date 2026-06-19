import { forwardRef, type ReactNode } from "react";
import type { AppHeaderProfileProps, AppUser } from "../../types/app-header";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../utils/cn";
import { ChevronDown } from "lucide-react";
import { Avatar } from "../avatar/Avatar";

export const AppHeaderProfile = forwardRef<
  HTMLDivElement,
  AppHeaderProfileProps
>(function AppHeaderProfile(
  { user, children, className, variant = "full" },
  ref,
) {
  const isBasic = variant === "basic";

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div ref={ref} className={cn("gsl-app-header__profile", className)}>
          <Avatar name={user.name} src={user.avatar} size={32} />
          <div className="gsl-app-header__user-info">
            <span className="gsl-app-header__user-name">{user.name}</span>
            <span className="gsl-app-header__user-role">{user.role}</span>
          </div>
          <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={cn(
            "gsl-profile-popover",
            isBasic && "gsl-profile-popover--basic",
          )}
          side="top"
          align="end"
          sideOffset={0}
          role="menu"
        >
          {isBasic ? (
            <>
              <div className="gsl-profile-popover__header">
                <Avatar name={user.name} src={user.avatar} size="lg" />
                <div className="gsl-profile-popover__header-info">
                  <span className="gsl-profile-popover__name">{user.name}</span>
                  <span className="gsl-profile-popover__role">{user.role}</span>
                </div>
              </div>
              {children}
            </>
          ) : (
            <>
              <div className="gsl-profile-popover__header">
                <Avatar name={user.name} src={user.avatar} size="lg" />
                <span className="gsl-profile-popover__name">{user.name}</span>
                {user.email && (
                  <span className="gsl-profile-popover__email">
                    {user.email}
                  </span>
                )}
              </div>
              {children && (
                <div className="gsl-profile-popover__actions">{children}</div>
              )}
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});

(AppHeaderProfile as any).componentId = "AppHeaderProfile";
