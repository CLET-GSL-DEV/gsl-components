import { useState } from "react";
import { ProfilePopover, RoleSelect } from "@rfdtech/components";
import { Shield, Eye, ScrollText, User, Settings, HelpCircle } from "lucide-react";

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

export function ProfilePopoverUserTriggerExample() {
  const [variant, setVariant] = useState<"full" | "avatar">("full");
  const [selectedRole, setSelectedRole] = useState("admin");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        className="gsl-profile-menu__item"
        style={{ alignSelf: "flex-start" }}
        onClick={() => setVariant((v) => (v === "full" ? "avatar" : "full"))}
      >
        <span>Switch trigger to {variant === "full" ? "avatar" : "full"}</span>
      </button>

      <div
        style={{
          display: "inline-flex",
          padding: 8,
          borderRadius: "var(--gsl-radius-2xl)",
          background: "var(--gsl-surface-subtle)",
        }}
      >
        <ProfilePopover
          user={user}
          variant={variant}
          items={[
            {
              icon: <User size={20} strokeWidth={1.5} aria-hidden />,
              label: "My Profile",
              onClick: () => console.log("My Profile"),
            },
            {
              icon: <Settings size={20} strokeWidth={1.5} aria-hidden />,
              label: "Account Settings",
              onClick: () => console.log("Account Settings"),
            },
            {
              icon: <HelpCircle size={20} strokeWidth={1.5} aria-hidden />,
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
      </div>
    </div>
  );
}
