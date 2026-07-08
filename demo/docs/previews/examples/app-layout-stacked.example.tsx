import { useState } from "react";
import {
  AppLayout,
  AppHeader,
  AppHeaderActions,
  AppHeaderSearch,
  AppHeaderProfile,
  AppSidebar,
  AppBody,
  Sidebar,
  SidebarContent,
  SidebarNav,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
} from "@rfdtech/components";
import { LayoutDashboard, Users, Settings } from "lucide-react";
import type { AppHeaderSearchDataGroup } from "@rfdtech/components";

const user = {
  name: "Kwame Asante",
  role: "Admin",
  initials: "KA",
  email: "kwame@gsl.edu.gh",
};

const links = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "members", label: "Members", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AppLayoutStackedExample() {
  const [search, setSearch] = useState("");

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
          ],
        },
      ]
    : [];

  return (
    <div style={{ height: 400, borderRadius: "var(--gsl-radius-2xl)", overflow: "hidden" }}>
      {/* variant="stacked": full-width header on top, sidebar + content side by side below */}
      <AppLayout variant="stacked">
        <AppHeader>
          <AppHeaderSearch
            data={searchGroups}
            onSearch={setSearch}
            showEmpty
            placeholder="Search members, projects…"
          />
          <AppHeaderActions>
            <AppHeaderProfile user={user}>
              <button
                type="button"
                className="gsl-profile-popover__action gsl-profile-popover__action--danger"
              >
                <span className="gsl-profile-popover__action-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                <span className="gsl-profile-popover__action-label">Sign out</span>
              </button>
            </AppHeaderProfile>
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
            Page content — full-width header on top, sidebar and content side by side
          </div>
        </AppBody>
      </AppLayout>
    </div>
  );
}
