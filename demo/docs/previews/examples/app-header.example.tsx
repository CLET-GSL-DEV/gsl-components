import { useState } from "react";
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderSearch,
  AppHeaderNotifications,
  AppHeaderNotificationItem,
  AppSwitcher,
  ProfilePopover,
  RoleSelect,
  SystemAppIcon,
} from "@rfdtech/components";
import type { AppHeaderSearchDataGroup } from "@rfdtech/components";
import { Shield, Eye, ScrollText } from "lucide-react";

const user = {
  name: "Kwame Asante",
  role: "Admin",
  initials: "KA",
  email: "kwame@clet.edu.gh",
};

const roles = [
  { id: "admin", name: "Admin", icon: <Shield size={16} strokeWidth={1.5} /> },
  { id: "reviewer", name: "Reviewer", icon: <Eye size={16} strokeWidth={1.5} /> },
  { id: "auditor", name: "Auditor", icon: <ScrollText size={16} strokeWidth={1.5} /> },
];

const apps = [
  {
    id: "gov-portal",
    name: "Governance Portal",
    icon: <SystemAppIcon name="Governance Portal" />,
    href: "https://portal.example.com",
  },
  {
    id: "finance-hub",
    name: "Finance Hub",
    icon: <SystemAppIcon name="Finance Hub" />,
    href: "https://finance.example.com",
  },
  {
    id: "hr-suite",
    name: "HR Suite",
    icon: <SystemAppIcon name="HR Suite" />,
  },
];

const notifications = [
  { id: "1", text: "A new member joined the Ghana chapter.", time: "2m ago", unread: true },
  { id: "2", text: "Your monthly report is ready.", time: "1h ago", unread: true },
  { id: "3", text: "System maintenance scheduled for 2:00 AM.", time: "3h ago", unread: false },
];

export function AppHeaderExample() {
  const [search, setSearch] = useState("");
  const [profileVariant, setProfileVariant] = useState<"full" | "avatar">(
    "full",
  );
  const [selectedRole, setSelectedRole] = useState("admin");

  const nextProfileVariant = ({ full: "avatar", avatar: "full" } as const)[
    profileVariant
  ];

  const searchGroups: AppHeaderSearchDataGroup[] = search
    ? [
        {
          heading: "Members",
          items: [
            {
              value: "kwame-asante",
              label: "Kwame Asante",
              onSelect: () => console.log("Selected member:", "Kwame Asante"),
            },
            {
              value: "abena-mensah",
              label: "Abena Mensah",
              onSelect: () => console.log("Selected member:", "Abena Mensah"),
            },
          ],
        },
        {
          heading: "Projects",
          items: [
            {
              value: "clet-platform",
              label: "CLET Platform",
              onSelect: () => console.log("Selected project:", "CLET Platform"),
            },
          ],
        },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        className="clet-profile-menu__item"
        style={{ alignSelf: "flex-start" }}
        onClick={() => setProfileVariant(nextProfileVariant)}
      >
        <span>Switch profile trigger to {nextProfileVariant}</span>
      </button>
      <AppHeader>
        <AppHeaderSearch
          data={searchGroups}
          onSearch={setSearch}
          showEmpty
          placeholder="Search members, projects…"
        />
        <AppHeaderActions>
          <AppSwitcher apps={apps} />
          <AppHeaderNotifications>
            {notifications.map((n) => (
              <AppHeaderNotificationItem
                key={n.id}
                text={n.text}
                time={n.time}
                unread={n.unread}
              />
            ))}
          </AppHeaderNotifications>
          <ProfilePopover
            user={user}
            variant={profileVariant}
            onSignOut={() => console.log("Sign out")}
          >
            <RoleSelect
              title="View as"
              roles={roles}
              selectedRole={selectedRole}
              onClickRole={(role) => setSelectedRole(role.id)}
            />
          </ProfilePopover>
        </AppHeaderActions>
      </AppHeader>
      <div
        style={{
          height: 120,
          borderRadius: "var(--clet-radius-2xl)",
          background: "var(--clet-surface-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "var(--clet-text-muted)",
          border: "1px dashed var(--clet-border)",
        }}
      >
        Page content goes here
      </div>
    </div>
  );
}
