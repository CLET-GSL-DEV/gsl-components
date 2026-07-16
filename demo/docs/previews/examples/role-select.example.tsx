import { RoleSelect } from "@rfdtech/components";
import { Eye, ScrollText, Shield } from "lucide-react";
import { useState } from "react";

const roles = [
  { id: "admin", name: "Admin", icon: <Shield size={16} /> },
  { id: "reviewer", name: "Reviewer", icon: <Eye size={16} /> },
  { id: "auditor", name: "Auditor", icon: <ScrollText size={16} />, disabled: true },
];

export function RoleSelectExample() {
  const [selectedRole, setSelectedRole] = useState("admin");

  return (
    <RoleSelect
      title="View as"
      roles={roles}
      selectedRole={selectedRole}
      onClickRole={(role) => setSelectedRole(role.id)}
    />
  );
}
