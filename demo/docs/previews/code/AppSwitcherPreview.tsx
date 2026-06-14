import { AppSwitcher } from "@rfdtech/components";
import { demoApps } from "../../../data/demoApps";

export function AppSwitcherPreview() {
  return (
    <AppSwitcher
      apps={demoApps}
      title="System directory"
      onAppSelect={(app) => console.log("Selected:", app.name)}
    />
  );
}
