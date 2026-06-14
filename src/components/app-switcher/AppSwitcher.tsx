import { useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useAppSwitcher } from "./hooks/useAppSwitcher";
import { useMeApps } from "./hooks/useMeApps";
import type { AppItem, AppSwitcherProps } from "../../types/app-switcher";
import { AppSwitcherItem } from "./AppSwitcherItem";
import { GridIcon } from "./GridIcon";
import "./styles/app-switcher.css";

function getPopoverPlacement(placement: AppSwitcherProps["placement"]) {
  switch (placement) {
    case "bottom-start":
      return { side: "bottom" as const, align: "start" as const };
    case "bottom":
      return { side: "bottom" as const, align: "center" as const };
    case "bottom-end":
    default:
      return { side: "bottom" as const, align: "end" as const };
  }
}

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

  const { open, setOpen, close } = useAppSwitcher({
    open: controlledOpen,
    onOpenChange,
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
  const panelClass = ["gsl-app-switcher__panel"].filter(Boolean).join(" ");
  const popoverPlacement = getPopoverPlacement(placement);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className={rootClass} style={style}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="gsl-app-switcher__trigger"
            aria-label={triggerLabel}
          >
            {trigger ?? <GridIcon />}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={panelClass}
            side={popoverPlacement.side}
            align={popoverPlacement.align}
            sideOffset={8}
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
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
}
