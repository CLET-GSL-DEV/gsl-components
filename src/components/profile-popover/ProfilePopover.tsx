import { forwardRef, useContext } from "react";
import * as Popover from "@radix-ui/react-popover";
import { LogOut, ChevronDown, Sun, Moon } from "lucide-react";
import { Avatar } from "../avatar/Avatar";
import type { ProfilePopoverProps } from "../../types/profile-popover";
import { cn } from "../../utils/cn";
import { ThemeContext } from "../theme/ThemeContext";
import "./styles/profile-popover.css";

export const ProfilePopover = forwardRef<HTMLElement, ProfilePopoverProps>(
  function ProfilePopover(
    {
      fullName,
      email,
      profilePhoto,
      user,
      variant = "full",
      trigger,
      triggerClassName,
      items,
      onSignOut,
      children,
      side = "top",
      align = "start",
      sideOffset = 8,
      className,
      loading = false,
      loadingLabel = "Loading profile",
    },
    ref,
  ) {
    const resolvedFullName = fullName ?? user?.name ?? "";
    const resolvedEmail = email ?? user?.email;
    const resolvedPhoto = profilePhoto ?? user?.avatar;
    const isAvatarOnly = variant === "avatar";

    const themeContext = useContext(ThemeContext);
    const themeToggle = themeContext ? (
      <button
        type="button"
        className="gsl-profile-menu__header-action-btn"
        aria-label={
          themeContext.resolvedTheme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        onClick={() =>
          themeContext.setTheme(
            themeContext.resolvedTheme === "dark" ? "light" : "dark",
          )
        }
      >
        {themeContext.resolvedTheme === "dark" ? (
          <Sun size={18} strokeWidth={1.5} aria-hidden />
        ) : (
          <Moon size={18} strokeWidth={1.5} aria-hidden />
        )}
      </button>
    ) : null;

    const headerStyleTrigger = user ? (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          "gsl-app-header__profile",
          isAvatarOnly && "gsl-app-header__profile--avatar",
          triggerClassName,
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
    ) : (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cn("gsl-profile-menu__trigger", triggerClassName)}
      >
        {loading ? (
          <span
            className="gsl-skeleton gsl-profile-menu__skeleton-avatar"
            aria-hidden
          />
        ) : (
          <Avatar
            name={resolvedFullName}
            src={resolvedPhoto}
            size="md"
            backgroundVar="--gsl-profile-avatar-bg"
          />
        )}
        <div
          className={cn(
            "gsl-profile-menu__trigger-info",
            loading && "gsl-profile-menu__trigger-info--loading",
          )}
        >
          {loading ? (
            <>
              <span className="gsl-skeleton gsl-profile-menu__skeleton-name" />
              <span className="gsl-skeleton gsl-profile-menu__skeleton-email" />
            </>
          ) : (
            <>
              <span className="gsl-profile-menu__trigger-name">
                {resolvedFullName}
              </span>
              {resolvedEmail && (
                <span className="gsl-profile-menu__trigger-email">
                  {resolvedEmail}
                </span>
              )}
            </>
          )}
        </div>
      </button>
    );

    const hasItems = Boolean(items && items.length > 0);
    const hasContent = loading || hasItems || Boolean(children);

    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          {trigger ?? headerStyleTrigger}
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={cn("gsl-profile-menu", className)}
            side={side}
            align={align}
            sideOffset={sideOffset}
            role="menu"
            aria-busy={loading || undefined}
          >
            {loading ? (
              <span className="gsl-profile-menu__sr-only" role="status">
                {loadingLabel}
              </span>
            ) : null}

            <div
              className="gsl-profile-menu__header"
              aria-hidden={loading || undefined}
            >
              {loading ? (
                <span className="gsl-skeleton gsl-profile-menu__skeleton-avatar gsl-profile-menu__skeleton-avatar--lg" />
              ) : (
                <Avatar
                  name={resolvedFullName}
                  src={resolvedPhoto}
                  size="lg"
                  backgroundVar="--gsl-profile-avatar-bg"
                />
              )}
              <div
                className={cn(
                  "gsl-profile-menu__header-info",
                  loading && "gsl-profile-menu__header-info--loading",
                )}
              >
                {loading ? (
                  <>
                    <span className="gsl-skeleton gsl-profile-menu__skeleton-name" />
                    <span className="gsl-skeleton gsl-profile-menu__skeleton-email" />
                  </>
                ) : (
                  <>
                    <span className="gsl-profile-menu__name">
                      {resolvedFullName}
                    </span>
                    {resolvedEmail && (
                      <span className="gsl-profile-menu__email">
                        {resolvedEmail}
                      </span>
                    )}
                  </>
                )}
              </div>
              {themeToggle && (
                <div className="gsl-profile-menu__header-action">
                  {themeToggle}
                </div>
              )}
            </div>

            {hasContent && <div className="gsl-profile-menu__divider" />}

            {loading ? (
              <div className="gsl-profile-menu__items">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="gsl-profile-menu__skeleton-item">
                    <span className="gsl-skeleton gsl-profile-menu__skeleton-item-icon" />
                    <span className="gsl-skeleton gsl-profile-menu__skeleton-item-label" />
                  </div>
                ))}
              </div>
            ) : hasContent ? (
              <div className="gsl-profile-menu__content">
                {hasItems && (
                  <div className="gsl-profile-menu__items">
                    {items!.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        className={cn(
                          "gsl-profile-menu__item",
                          item.danger && "gsl-profile-menu__item--danger",
                        )}
                        onClick={item.onClick}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {children}
              </div>
            ) : null}

            <div className="gsl-profile-menu__divider" />
            <div className="gsl-profile-menu__items gsl-profile-menu__items--signout">
              <button
                type="button"
                className="gsl-profile-menu__item gsl-profile-menu__item--danger"
                onClick={onSignOut}
              >
                <LogOut size={20} strokeWidth={1.5} aria-hidden />
                <span>Sign Out</span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

(ProfilePopover as unknown as { componentId: string }).componentId =
  "ProfilePopover";
