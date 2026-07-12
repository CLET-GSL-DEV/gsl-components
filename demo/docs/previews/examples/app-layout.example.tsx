import { useState } from "react";
import {
  AppLayout,
  AppHeader,
  AppHeaderActions,
  AppHeaderSearch,
  ProfilePopover,
  AppSidebar,
  AppBody,
  Sidebar,
  SidebarContent,
  SidebarNav,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  RoleSelect,
} from "@rfdtech/components";
import { LayoutDashboard, Users, Settings, Shield, Eye, ScrollText } from "lucide-react";
import type { AppHeaderSearchDataGroup } from "@rfdtech/components";

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

const links = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "members", label: "Members", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AppLayoutExample() {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin");

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
              value: "gsl-platform",
              label: "GSL Platform",
              onSelect: () => console.log("Selected project:", "GSL Platform"),
            },
          ],
        },
      ]
    : [];

  return (
    <div style={{ height: 400, borderRadius: "var(--gsl-radius-2xl)", overflow: "hidden" }}>
      <AppLayout>
        <AppHeader>
          <AppHeaderSearch
            data={searchGroups}
            onSearch={setSearch}
            showEmpty
            placeholder="Search members, projects…"
          />
          <AppHeaderActions>
            <ProfilePopover
              user={user}
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
        <AppSidebar>
          <Sidebar>
            <SidebarContent>
              <SidebarNav>
                <SidebarGroup>
                  <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                  {links.map((link) => (
                    <SidebarLink key={link.id} icon={<link.icon size={18} strokeWidth={1.5} />}>
                      {link.label}
                    </SidebarLink>
                  ))}
                </SidebarGroup>
              </SidebarNav>
            </SidebarContent>
          </Sidebar>
        </AppSidebar>
        <AppBody>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--gsl-text-muted)",
              fontSize: 14,
            }}
          >
            Page content — auto-positioned header, sidebar, and body
          </div>
        </AppBody>
      </AppLayout>
    </div>
  );
}
