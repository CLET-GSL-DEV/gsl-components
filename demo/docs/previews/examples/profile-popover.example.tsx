import { useState } from "react";
import { ProfilePopover, RoleSelect } from "@rfdtech/components";
import { User, Settings, HelpCircle, Shield, Eye, ScrollText } from "lucide-react";

const roles = [
  { id: "admin", name: "Admin", icon: <Shield size={16} strokeWidth={1.5} /> },
  { id: "reviewer", name: "Reviewer", icon: <Eye size={16} strokeWidth={1.5} /> },
  { id: "auditor", name: "Auditor", icon: <ScrollText size={16} strokeWidth={1.5} /> },
];

export function ProfilePopoverExample() {
  const [selectedRole, setSelectedRole] = useState("admin");

  return (
    <ProfilePopover
      fullName="Yaw Boateng"
      email="y.boateng@clet.gov.gh"
      items={[
        {
          icon: <User size={20} strokeWidth={1.5} />,
          label: "My Profile",
          onClick: () => console.log("My Profile"),
        },
        {
          icon: <Settings size={20} strokeWidth={1.5} />,
          label: "Account Settings",
          onClick: () => console.log("Account Settings"),
        },
        {
          icon: <HelpCircle size={20} strokeWidth={1.5} />,
          label: "Help & Support",
          onClick: () => console.log("Help & Support"),
        },
      ]}
      onSignOut={() => console.log("Sign out")}
    >
      <RoleSelect
        title="View as"
        roles={roles}
        selectedRole={selectedRole}
        onClickRole={(role) => setSelectedRole(role.id)}
      />
    </ProfilePopover>
  );
}
