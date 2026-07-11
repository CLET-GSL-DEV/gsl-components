import { forwardRef } from "react";
import type { AppHeaderProfileProps } from "../../types/app-header";
import type { ProfilePopoverItem } from "../../types/profile-popover";
import { cn } from "../../utils/cn";
import { ChevronDown, User, Settings, HelpCircle } from "lucide-react";
import { Avatar } from "../avatar/Avatar";
import { ProfilePopover } from "../profile-popover/ProfilePopover";

export const AppHeaderProfile = forwardRef<
  HTMLDivElement,
  AppHeaderProfileProps
>(function AppHeaderProfile(
  {
    user,
    children,
    className,
    variant = "full",
    headerAction,
    loading = false,
    loadingLabel = "Loading profile",
    onProfileClick,
    onSettingsClick,
    onHelpClick,
    onSignOut,
  },
  ref,
) {
  const isAvatarOnly = variant === "avatar";

  const trigger = (
    <div
      ref={ref}
      className={cn(
        "gsl-app-header__profile",
        isAvatarOnly && "gsl-app-header__profile--avatar",
        className,
      )}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span
          className="gsl-skeleton gsl-app-header__skeleton-avatar"
          aria-hidden
        />
      ) : (
        <Avatar
          name={user.name}
          src={user.avatar}
          size={32}
          backgroundVar="--gsl-profile-avatar-bg"
        />
      )}
      {!isAvatarOnly &&
        (loading ? (
          <span
            className="gsl-app-header__user-info gsl-app-header__user-info--loading"
            aria-hidden
          >
            <span className="gsl-skeleton gsl-app-header__skeleton-name" />
            <span className="gsl-skeleton gsl-app-header__skeleton-role" />
          </span>
        ) : (
          <>
            <div className="gsl-app-header__user-info">
              <span className="gsl-app-header__user-name">{user.name}</span>
              <span className="gsl-app-header__user-role">{user.role}</span>
            </div>
            <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
          </>
        ))}
      {loading ? (
        <span className="gsl-app-header__sr-only" role="status">
          {loadingLabel}
        </span>
      ) : null}
    </div>
  );

  const items: ProfilePopoverItem[] = [
    {
      icon: <User size={20} strokeWidth={1.5} aria-hidden />,
      label: "My Profile",
      onClick: onProfileClick,
    },
    {
      icon: <Settings size={20} strokeWidth={1.5} aria-hidden />,
      label: "Account Settings",
      onClick: onSettingsClick,
    },
    {
      icon: <HelpCircle size={20} strokeWidth={1.5} aria-hidden />,
      label: "Help & Support",
      onClick: onHelpClick,
    },
  ];

  return (
    <ProfilePopover
      trigger={trigger}
      fullName={user.name}
      email={user.email}
      profilePhoto={user.avatar}
      headerAction={headerAction}
      items={items}
      onSignOut={onSignOut}
      loading={loading}
      loadingLabel={loadingLabel}
      side="top"
      align="end"
      sideOffset={8}
    >
      {children}
    </ProfilePopover>
  );
});

(AppHeaderProfile as unknown as { componentId: string }).componentId = "AppHeaderProfile";
