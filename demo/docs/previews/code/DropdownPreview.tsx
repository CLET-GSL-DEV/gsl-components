import { useState } from "react";
import { Dropdown } from "@rfdtech/components";
import { departmentOptions } from "./shared";

export function DropdownPreview() {
  const [department, setDepartment] = useState<string | null>(null);

  return (
    <Dropdown
      ariaLabel="Department"
      value={department}
      onChange={setDepartment}
      placeholder="Choose department..."
      clearable
      options={departmentOptions}
      className="demo-dropdown"
    />
  );
}
