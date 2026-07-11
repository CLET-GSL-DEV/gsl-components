import { isValidElement, type KeyboardEvent } from "react";
import type { AppItem } from "../../types/app-switcher";
import { AppIconTile } from "./AppIconTile";
import { SystemAppIcon } from "./SystemAppIcon";

interface AppSwitcherItemProps {
  app: AppItem;
  onSelect: (app: AppItem) => void;
}

function renderIcon(icon: AppItem["icon"]) {
  if (typeof icon === "string") {
    if (icon.startsWith("http") || icon.startsWith("/") || icon.startsWith("data:")) {
      return <img src={icon} alt="" className="gsl-app-switcher__icon-image" />;
    }
    return <span className="gsl-app-switcher__icon-emoji">{icon}</span>;
  }
  return icon;
}

function isTileIcon(icon: AppItem["icon"]): boolean {
  return (
    isValidElement(icon) &&
    (icon.type === AppIconTile || icon.type === SystemAppIcon)
  );
}

export function AppSwitcherItem({ app, onSelect }: AppSwitcherItemProps) {
  const handleClick = () => {
    if (app.disabled) return;
    onSelect(app);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (app.disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(app);
    }
  };

  const iconClassName = [
    "gsl-app-switcher__icon",
    isTileIcon(app.icon) ? "gsl-app-switcher__icon--tile" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={iconClassName}>{renderIcon(app.icon)}</span>
      <span className="gsl-app-switcher__name">{app.name}</span>
      {app.badge && (
        <span className="gsl-app-switcher__badge">{app.badge}</span>
      )}
    </>
  );

  const className = [
    "gsl-app-switcher__item",
    app.disabled ? "gsl-app-switcher__item--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (app.href && !app.disabled) {
    return (
      <a
        href={app.href}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          onSelect(app);
        }}
        aria-disabled={app.disabled}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={app.disabled}
    >
      {content}
    </button>
  );
}
