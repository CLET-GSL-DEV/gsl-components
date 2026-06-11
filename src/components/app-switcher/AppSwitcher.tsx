import { useCallback } from "react";
import { useAppSwitcher } from "./hooks/useAppSwitcher";
import { useMeApps } from "./hooks/useMeApps";
import type { AppItem, AppSwitcherProps } from "../../types/app-switcher";
import { AppSwitcherItem } from "./AppSwitcherItem";
import { GridIcon } from "./GridIcon";
import "./styles/app-switcher.css";

export function AppSwitcher({
  apps: appsProp,
  baseUrl,
  accessToken,
  open: controlledOpen,
  onOpenChange,
  onAppSelect,
  columns = 3,
  triggerLabel = "Open app switcher",
  trigger,
  title,
  footer,
  className,
  style,
  placement = "bottom-end",
  closeOnSelect = true,
}: AppSwitcherProps) {
  const useRemoteApps = appsProp === undefined;
  const {
    apps: fetchedApps,
    loading,
    error,
  } = useMeApps({
    baseUrl: baseUrl ?? "",
    accessToken: accessToken ?? "",
    enabled: useRemoteApps,
  });
  const apps = appsProp ?? fetchedApps;

  const { open, toggle, close, triggerRef, panelRef } = useAppSwitcher({
    open: controlledOpen,
    onOpenChange,
    closeOnSelect,
  });

  const handleAppSelect = useCallback(
    (app: AppItem) => {
      app.onClick?.(app);
      onAppSelect?.(app);

      if (app.href) {
        window.open(app.href, app.href.startsWith("http") ? "_blank" : "_self");
      }

      if (closeOnSelect) {
        close();
      }
    },
    [onAppSelect, closeOnSelect, close],
  );

  const rootClass = ["gsl-app-switcher", className].filter(Boolean).join(" ");
  const panelClass = [
    "gsl-app-switcher__panel",
    `gsl-app-switcher__panel--${placement}`,
    open ? "gsl-app-switcher__panel--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} style={style}>
      <button
        ref={triggerRef}
        type="button"
        className="gsl-app-switcher__trigger"
        onClick={toggle}
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {trigger ?? <GridIcon />}
      </button>

      {open && (
        <div
          ref={panelRef}
          className={panelClass}
          role="menu"
          aria-label={title ?? "Apps"}
        >
          {title && <div className="gsl-app-switcher__title">{title}</div>}

          {loading && (
            <div className="gsl-app-switcher__status">Loading systems...</div>
          )}

          {!loading && error && (
            <div className="gsl-app-switcher__status gsl-app-switcher__status--error">
              {error}
            </div>
          )}

          {!loading && !error && apps.length === 0 && (
            <div className="gsl-app-switcher__status">
              No systems available.
            </div>
          )}

          {!loading && !error && apps.length > 0 && (
            <div
              className="gsl-app-switcher__grid"
              style={
                {
                  "--gsl-columns": columns,
                } as React.CSSProperties
              }
            >
              {apps.map((app) => (
                <AppSwitcherItem
                  key={app.id}
                  app={app}
                  onSelect={handleAppSelect}
                />
              ))}
            </div>
          )}

          {footer && (
            <div className="gsl-app-switcher__footer">{footer}</div>
          )}
        </div>
      )}
    </div>
  );
}
