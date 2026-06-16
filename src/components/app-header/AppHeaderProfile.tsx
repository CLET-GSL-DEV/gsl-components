import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface AppUser {
  name: string;
  role: string;
  avatar?: string;
  initials: string;
}

export interface AppHeaderProfileProps {
  user: AppUser;
  className?: string;
}

export const AppHeaderProfile = forwardRef<HTMLDivElement, AppHeaderProfileProps>(
  function AppHeaderProfile({ user, className }, ref) {
    return (
      <div ref={ref} className={cn("gsl-app-header__profile", className)}>
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
    );
  },
);

(AppHeaderProfile as any).componentId = "AppHeaderProfile";
