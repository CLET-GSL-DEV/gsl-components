import { cloneElement, type ReactElement } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/ssr";
import "./styles/app-header.css";

interface AppHeaderOverflowProps {
  label: string;
  search: ReactElement | null;
  apps: ReactElement | null;
  notifications: ReactElement | null;
  fontSize: ReactElement | null;
}

/**
 * Mobile-only "More actions" menu. AppHeader plucks the header actions out of
 * its children and hands them here, so on a phone they sit behind one trigger
 * instead of crowding the bar. Each action keeps its own behaviour: the rows
 * render the original elements next to a text label.
 */
export function AppHeaderOverflow({
  label,
  search,
  apps,
  notifications,
  fontSize,
}: AppHeaderOverflowProps): ReactElement | null {
  const rows: { key: string; label: string; element: ReactElement }[] = [];
  if (apps) rows.push({ key: "apps", label: "Apps", element: apps });
  if (notifications) {
    rows.push({ key: "notifications", label: "Notifications", element: notifications });
  }
  if (fontSize) rows.push({ key: "font-size", label: "Text size", element: fontSize });

  if (!search && rows.length === 0) {
    return null;
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="clet-app-header__overflow-trigger gsl-app-header__overflow-trigger"
          aria-label={label}
        >
          <DotsThreeVerticalIcon size={22} weight="duotone" aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="clet-app-header__overflow gsl-app-header__overflow"
          side="bottom"
          align="end"
          sideOffset={8}
          aria-label={label}
        >
          {search ? (
            <div className="clet-app-header__overflow-row gsl-app-header__overflow-row clet-app-header__overflow-row--stacked gsl-app-header__overflow-row--stacked">
              <span className="clet-app-header__overflow-label gsl-app-header__overflow-label">
                Search
              </span>
              {/* Always the full field here: a collapsible search would
                  otherwise sit in the panel as a lone icon. */}
              {cloneElement(search as ReactElement<{ collapsible?: boolean }>, {
                collapsible: false,
              })}
            </div>
          ) : null}
          {rows.map((row) => (
            <div
              key={row.key}
              className="clet-app-header__overflow-row gsl-app-header__overflow-row"
            >
              <span className="clet-app-header__overflow-label gsl-app-header__overflow-label">
                {row.label}
              </span>
              {row.element}
            </div>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
