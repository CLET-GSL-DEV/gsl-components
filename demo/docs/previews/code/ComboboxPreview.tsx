import { useState } from "react";
import { Combobox } from "@rfdtech/components";
import { allUsers, loadUsers } from "./shared";

export function ComboboxPreview() {
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <Combobox
      ariaLabel="User"
      value={userId}
      onChange={setUserId}
      loadOptions={loadUsers}
      placeholder="Search users..."
      clearable
      className="demo-combobox"
      getOptionLabel={(id) => allUsers.find((user) => user.value === id)?.label}
    />
  );
}
