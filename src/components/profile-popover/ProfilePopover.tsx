import { Fragment } from "react";
import * as Popover from "@radix-ui/react-popover";
import { LogOut } from "lucide-react";
import { Avatar } from "../avatar/Avatar";
import type { ProfilePopoverProps } from "../../types/profile-popover";
import { cn } from "../../utils/cn";
import "./styles/profile-popover.css";

export function ProfilePopover({
  fullName,
  email,
  profilePhoto,
  trigger,
  headerAction,
  items,
  onSignOut,
  children,
  side = "top",
  align = "start",
  sideOffset = 8,
  className,
  loading = false,
  loadingLabel = "Loading profile",
}: ProfilePopoverProps) {
  const defaultTrigger = (
    <button type="button" className="gsl-profile-menu__trigger">
      {loading ? (
        <span
          className="gsl-skeleton gsl-profile-menu__skeleton-avatar"
          aria-hidden
        />
      ) : (
        <Avatar
          name={fullName}
          src={profilePhoto}
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
            <span className="gsl-profile-menu__trigger-name">{fullName}</span>
            {email && (
              <span className="gsl-profile-menu__trigger-email">{email}</span>
            )}
          </>
        )}
      </div>
    </button>
  );

  const sections = [
    loading ? (
      <div className="gsl-profile-menu__items">
        {[1, 2, 3].map((i) => (
          <div key={i} className="gsl-profile-menu__skeleton-item">
            <span className="gsl-skeleton gsl-profile-menu__skeleton-item-icon" />
            <span className="gsl-skeleton gsl-profile-menu__skeleton-item-label" />
          </div>
        ))}
      </div>
    ) : items && items.length > 0 ? (
      <div className="gsl-profile-menu__items">
        {items.map((item, index) => (
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
    ) : null,
    loading ? null : (children ?? null),
    <div className="gsl-profile-menu__items gsl-profile-menu__items--signout">
      <button
        type="button"
        className="gsl-profile-menu__item gsl-profile-menu__item--danger"
        onClick={onSignOut}
      >
        <LogOut size={20} strokeWidth={1.5} aria-hidden />
        <span>Sign Out</span>
      </button>
    </div>,
  ].filter(Boolean);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger ?? defaultTrigger}</Popover.Trigger>

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
                name={fullName}
                src={profilePhoto}
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
                  <span className="gsl-profile-menu__name">{fullName}</span>
                  {email && (
                    <span className="gsl-profile-menu__email">{email}</span>
                  )}
                </>
              )}
            </div>
            {headerAction && (
              <div className="gsl-profile-menu__header-action">
                {headerAction}
              </div>
            )}
          </div>

          {sections.map((section, index) => (
            <Fragment key={index}>
              <div className="gsl-profile-menu__divider" />
              {section}
            </Fragment>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
