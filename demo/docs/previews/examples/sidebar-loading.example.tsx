import { useState } from "react";
import { Bell, LayoutGrid, Shield, Users } from "lucide-react";
import {
  Sidebar,
  SidebarBadge,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarProvider,
} from "@rfdtech/components";

const links = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, badge: undefined },
  { id: "users", label: "Users", icon: Users, badge: undefined },
  { id: "roles", label: "Roles & Permissions", icon: Shield, badge: undefined },
  {
    id: "notifications",
    label: "Notification Templates",
    icon: Bell,
    badge: "New",
  },
] as const;

export function SidebarLoadingExample() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>("users");

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

      <SidebarProvider>
        <div style={{ maxWidth: 280 }}>
          <Sidebar>
            <SidebarHeader>
              <span className="gsl-sidebar__header-title">Navigation</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav aria-label="Main navigation">
                <SidebarGroup>
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <SidebarItem key={i}>
                          <SidebarLink loading icon={<span />}>
                            Loading
                          </SidebarLink>
                        </SidebarItem>
                      ))
                    : links.map(({ id, label, icon: Icon, badge }) => (
                        <SidebarItem key={id}>
                          <SidebarLink
                            icon={<Icon size={20} strokeWidth={1.75} />}
                            active={active === id}
                            onClick={() => setActive(id)}
                          >
                            {label}
                            {badge ? <SidebarBadge>{badge}</SidebarBadge> : null}
                          </SidebarLink>
                        </SidebarItem>
                      ))}
                </SidebarGroup>
              </SidebarNav>
            </SidebarContent>
          </Sidebar>
        </div>
      </SidebarProvider>
    </div>
  );
}
