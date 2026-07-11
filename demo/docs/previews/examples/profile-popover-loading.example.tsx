import { useState } from "react";
import { ProfilePopover, RoleSelect } from "@rfdtech/components";
import { Shield, Eye, ScrollText } from "lucide-react";

const roles = [
  { id: "admin", name: "Admin", icon: <Shield size={16} strokeWidth={1.5} /> },
  { id: "reviewer", name: "Reviewer", icon: <Eye size={16} strokeWidth={1.5} /> },
  { id: "auditor", name: "Auditor", icon: <ScrollText size={16} strokeWidth={1.5} /> },
];

export function ProfilePopoverLoadingExample() {
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("admin");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        className="gsl-profile-menu__item"
        style={{ alignSelf: "flex-start" }}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1500);
        }}
      >
        <span>Simulate loading</span>
      </button>

      <ProfilePopover
        fullName="Yaw Boateng"
        email="y.boateng@clet.gov.gh"
        loading={loading}
        loadingLabel="Loading profile..."
        onSignOut={() => console.log("Sign out")}
      >
        <RoleSelect
          title="View as"
          roles={roles}
          selectedRole={selectedRole}
          onClickRole={(role) => setSelectedRole(role.id)}
        />
      </ProfilePopover>
    </div>
  );
}
