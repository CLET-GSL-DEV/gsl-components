import { useState } from "react";
import {
  AppLayout,
  AppHeader,
  AppHeaderActions,
  AppHeaderBranding,
  AppHeaderNotifications,
  AppHeaderProfile,
  AppSwitcher,
  AppSidebar,
  AppBody,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  SidebarBadge,
} from "@rfdtech/components";
import {
  Bell,
  BookOpen,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-react";

const user = {
  name: "Kwame Asante",
  role: "Admin",
  initials: "KA",
  email: "kwame@gsl.edu.gh",
};

const apps = [
  {
    id: "gov-portal",
    name: "Governance Portal",
    icon: "https://ui-avatars.com/api/?name=Governance+Portal&background=1d4ed8&color=fff&size=96",
  },
  {
    id: "finance-hub",
    name: "Finance Hub",
    icon: "https://ui-avatars.com/api/?name=Finance+Hub&background=047857&color=fff&size=96",
  },
];

const notifications = [
  { id: "1", text: "A new member joined the Ghana chapter.", time: "2m ago", unread: true },
  { id: "2", text: "Your monthly report is ready.", time: "1h ago", unread: false },
];

const navGroups = [
  {
    label: "Main",
    links: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "members", label: "Members", icon: Users },
      { id: "docs", label: "Documentation", icon: BookOpen, badge: "New" },
    ],
  },
  {
    label: "Analytics",
    links: [
      { id: "reports", label: "Reports", icon: FileText },
      { id: "alerts", label: "Alerts", icon: Bell, badge: "8" },
      { id: "permissions", label: "Permissions", icon: Shield },
    ],
  },
];

export function AppLayoutStackedExample() {
  const [active, setActive] = useState("members");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(["Main"]),
  );

  const toggleGroup = (label: string, expanded: boolean) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (expanded) next.add(label);
      else next.delete(label);
      return next;
    });
  };

  return (
    <div style={{ height: 480, borderRadius: "var(--gsl-radius-2xl)", overflow: "hidden" }}>
      {/* Dashboard shell: variant="stacked" AppLayout + variant="plain" AppHeader/Sidebar */}
      <AppLayout variant="stacked">
        <AppHeader variant="plain">
          <AppHeaderBranding title="GSL PORTAL" subtitle="Component Library" />
          <AppHeaderActions>
            <AppSwitcher apps={apps} title="System directory" />
            <AppHeaderNotifications>
              {notifications.map((n) => (
                <div key={n.id} className="gsl-notif-popover__item">
                  {n.unread && <div className="gsl-notif-popover__dot" />}
                  <div className="gsl-notif-popover__body">
                    <div className="gsl-notif-popover__body-text">{n.text}</div>
                    <div className="gsl-notif-popover__body-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </AppHeaderNotifications>
            <AppHeaderProfile variant="avatar" user={user}>
              <button
                type="button"
                className="gsl-profile-popover__action gsl-profile-popover__action--danger"
              >
                <span className="gsl-profile-popover__action-label">Sign out</span>
              </button>
            </AppHeaderProfile>
          </AppHeaderActions>
        </AppHeader>
        <AppSidebar>
          <Sidebar variant="plain">
            <SidebarContent>
              <SidebarNav>
                {navGroups.map((group) => (
                  <SidebarGroup
                    key={group.label}
                    collapsible
                    expanded={expandedGroups.has(group.label)}
                    onExpandedChange={(expanded) => toggleGroup(group.label, expanded)}
                  >
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    {group.links.map((link) => (
                      <SidebarLink
                        key={link.id}
                        active={active === link.id}
                        icon={<link.icon size={18} strokeWidth={1.5} />}
                        onClick={() => setActive(link.id)}
                      >
                        {link.label}
                        {link.badge && <SidebarBadge>{link.badge}</SidebarBadge>}
                      </SidebarLink>
                    ))}
                  </SidebarGroup>
                ))}
              </SidebarNav>
            </SidebarContent>
            <SidebarFooter>
              <button type="button" className="gsl-sidebar__link" style={{ width: "100%" }}>
                <ChevronRight size={16} strokeWidth={1.5} />
                <span className="gsl-sidebar__link-label">Back to main dashboard</span>
              </button>
            </SidebarFooter>
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
            Page content — full-width plain header on top, plain sidebar and
            content side by side below
          </div>
        </AppBody>
      </AppLayout>
    </div>
  );
}
