import { forwardRef } from "react";
import type { AppHeaderProfileProps } from "../../types/app-header";
import type { ProfilePopoverItem } from "../../types/profile-popover";
import { cn } from "../../utils/cn";
import { ChevronDown, User, Settings, HelpCircle } from "lucide-react";
import { Avatar } from "../avatar/Avatar";
import { ProfilePopover } from "../profile-popover/ProfilePopover";

/**
 * @deprecated Use `ProfilePopover` directly (pass `user`/`variant` for the same trigger) — see
 * the [migration guide](/docs/migration-v2). Kept as a thin wrapper for backward compatibility;
 * `headerAction` no longer has any effect since `ProfilePopover`'s theme toggle is automatic now.
 */
export const AppHeaderProfile = forwardRef<
  HTMLDivElement,
  AppHeaderProfileProps
>(function AppHeaderProfile(
  {
    user,
    children,
    className,
    variant = "full",
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
        "clet-app-header__profile gsl-app-header__profile",
        isAvatarOnly && "clet-app-header__profile--avatar gsl-app-header__profile--avatar",
        className,
      )}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span
          className="clet-skeleton gsl-skeleton clet-app-header__skeleton-avatar gsl-app-header__skeleton-avatar"
          aria-hidden
        />
      ) : (
        <Avatar
          name={user.name}
          src={user.avatar}
          size={32}
          backgroundVar="--clet-profile-avatar-bg"
        />
      )}
      {!isAvatarOnly &&
        (loading ? (
          <span
            className="clet-app-header__user-info gsl-app-header__user-info clet-app-header__user-info--loading gsl-app-header__user-info--loading"
            aria-hidden
          >
            <span className="clet-skeleton gsl-skeleton clet-app-header__skeleton-name gsl-app-header__skeleton-name" />
            <span className="clet-skeleton gsl-skeleton clet-app-header__skeleton-role gsl-app-header__skeleton-role" />
          </span>
        ) : (
          <>
            <div className="clet-app-header__user-info gsl-app-header__user-info">
              <span className="clet-app-header__user-name gsl-app-header__user-name">{user.name}</span>
              <span className="clet-app-header__user-role gsl-app-header__user-role">{user.role}</span>
            </div>
            <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
          </>
        ))}
      {loading ? (
        <span className="clet-app-header__sr-only gsl-app-header__sr-only" role="status">
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
