import { useState } from "react";
import {
  AppLayout,
  AppHeader,
  AppHeaderActions,
  AppSidebar,
  AppBody,
  Sidebar,
  SidebarContent,
  SidebarNav,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  Button,
} from "@rfdtech/components";
import { LayoutDashboard, Users, Settings } from "lucide-react";

const links = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "members", label: "Members", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AppLayoutExample() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ height: 400, borderRadius: "var(--gsl-radius-2xl)", overflow: "hidden" }}>
      <AppLayout>
        <AppHeader>
          <AppHeaderActions>
            <Button variant="secondary" size="sm" onClick={() => setCount((c) => c + 1)}>
              Clicked {count} times
            </Button>
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
