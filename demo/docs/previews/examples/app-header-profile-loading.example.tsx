import { useState } from "react";
import { AppHeaderProfile, RoleSelect } from "@rfdtech/components";
import { Shield, Eye, ScrollText } from "lucide-react";

const user = {
  name: "Kwame Asante",
  role: "Admin",
  initials: "KA",
  email: "kwame@gsl.edu.gh",
};

const roles = [
  { id: "admin", name: "Admin", icon: <Shield size={16} strokeWidth={1.5} /> },
  { id: "reviewer", name: "Reviewer", icon: <Eye size={16} strokeWidth={1.5} /> },
  { id: "auditor", name: "Auditor", icon: <ScrollText size={16} strokeWidth={1.5} /> },
];

export function AppHeaderProfileLoadingExample() {
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

      <div
        style={{
          display: "inline-flex",
          padding: 8,
          borderRadius: "var(--gsl-radius-2xl)",
          background: "var(--gsl-surface-subtle)",
        }}
      >
        <AppHeaderProfile
          user={user}
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
        </AppHeaderProfile>
      </div>
    </div>
  );
}
