import { Launchpad, RoleSelect } from "@rfdtech/components";

export function LaunchpadLoadingExample() {
  return (
    <Launchpad apps={[]} loading>
      <RoleSelect
        title="View as"
        roles={[{ id: "admin", name: "Admin" }]}
        selectedRole="admin"
        onClickRole={() => {}}
      />
    </Launchpad>
  );
}
