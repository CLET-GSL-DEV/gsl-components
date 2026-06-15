import { AppSwitcher } from "@rfdtech/components";

export function AppSwitcherLoadingExample() {
  return (
    <AppSwitcher
      apps={[]}
      loading
      loadingLabel="Loading systems..."
      title="System directory"
    />
  );
}
