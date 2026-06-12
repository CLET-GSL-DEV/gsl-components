import { AppSwitcher } from "@rfdtech/components";

export function AppSwitcherPreview() {
  return (
    <AppSwitcher
      baseUrl=""
      accessToken="demo-token"
      title="System directory"
      onAppSelect={(app) => console.log("Selected:", app.name)}
    />
  );
}
