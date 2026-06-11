import { createElement } from "react";
import { SystemAppIcon } from "../SystemAppIcon";
import type { AppItem, MeApp } from "../../../types/app-switcher";

export function mapMeAppToAppItem(app: MeApp): AppItem {
  return {
    id: app.system_id,
    name: app.system_name,
    icon: createElement(SystemAppIcon, { name: app.system_name }),
    href: app.frontend_url || undefined,
    disabled: !app.frontend_url,
    badge: app.role,
    metadata: app,
  };
}

export function mapMeAppsToAppItems(apps: MeApp[]): AppItem[] {
  return apps.map(mapMeAppToAppItem);
}
