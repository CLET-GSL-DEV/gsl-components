import { Dropdown } from "@rfdtech/components";

const options = [
  { value: "email", label: "Email" },
  { value: "name", label: "Full name" },
  { value: "year", label: "Year" },
];

export function DropdownExample() {
  return (
    <div style={{ width: "240px" }}>
      <Dropdown
        aria-label="Field"
        value="email"
        onValueChange={() => {}}
        options={options}
        clearable
      />
    </div>
  );
}
