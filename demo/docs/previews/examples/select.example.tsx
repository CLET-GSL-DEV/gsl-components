import { Select } from "@rfdtech/components";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
  { value: "contributor", label: "Contributor" },
];

export function SelectExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>Default</p>
        <Select options={roles} value="" onValueChange={() => {}} placeholder="Select role" />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>Invalid</p>
        <Select options={roles} value="" onValueChange={() => {}} placeholder="Select role" invalid />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>Disabled</p>
        <Select options={roles} value="" onValueChange={() => {}} placeholder="Select role" disabled />
      </div>
    </div>
  );
}
