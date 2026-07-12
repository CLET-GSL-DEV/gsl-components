import type { KeyboardEvent } from "react";
import type { LaunchpadApp } from "../../types/launchpad";

interface LaunchpadItemProps {
  app: LaunchpadApp;
  onSelect: (app: LaunchpadApp) => void;
}

export function LaunchpadItem({ app, onSelect }: LaunchpadItemProps) {
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

  const content = (
    <>
      <span className="gsl-launchpad__icon">{app.icon}</span>
      <span className="gsl-launchpad__name">{app.name}</span>
      {app.badge && <span className="gsl-launchpad__badge">{app.badge}</span>}
    </>
  );

  const className = [
    "gsl-launchpad__item",
    app.disabled ? "gsl-launchpad__item--disabled" : "",
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
