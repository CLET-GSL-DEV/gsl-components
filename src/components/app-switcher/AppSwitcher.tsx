import { useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Loader2 } from "lucide-react";
import { useAppSwitcher } from "./hooks/useAppSwitcher";
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
  apps,
  loading = false,
  loadingLabel = "Loading systems...",
  open: controlledOpen,
  onOpenChange,
  onAppSelect,
  columns = 3,
  maxItems = 6,
  triggerLabel = "Open app switcher",
  trigger,
  title,
  footer,
  children,
  className,
  style,
  placement = "bottom-end",
  closeOnSelect = true,
}: AppSwitcherProps) {
  const { open, setOpen, close } = useAppSwitcher({
    open: controlledOpen,
    onOpenChange,
  });

  const visibleApps = apps.slice(0, maxItems);

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

            {loading ? (
              <div
                className="gsl-app-switcher__loading"
                aria-busy="true"
                aria-label={loadingLabel}
              >
                <Loader2
                  className="gsl-app-switcher__spinner"
                  size={24}
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="gsl-app-switcher__loading-text">
                  {loadingLabel}
                </span>
              </div>
            ) : null}

            {!loading && apps.length === 0 ? (
              <div className="gsl-app-switcher__status">
                No systems available.
              </div>
            ) : null}

            {!loading && visibleApps.length > 0 ? (
              <div
                className="gsl-app-switcher__grid"
                style={
                  {
                    "--gsl-columns": columns,
                  } as React.CSSProperties
                }
              >
                {visibleApps.map((app) => (
                  <AppSwitcherItem
                    key={app.id}
                    app={app}
                    onSelect={handleAppSelect}
                  />
                ))}
              </div>
            ) : null}

            {children && (
              <div className="gsl-app-switcher__extra">{children}</div>
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

(AppSwitcher as unknown as { componentId: string }).componentId = "AppSwitcher";
