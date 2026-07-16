import { useState } from "react";
import { LayoutGrid, Shield, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarProvider,
} from "@rfdtech/components";

const links = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "users", label: "Users", icon: Users },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
] as const;

export function SidebarPlainExample() {
  const [active, setActive] = useState<string>("users");

  return (
    <SidebarProvider>
      <div
        style={{
          display: "flex",
          height: 280,
          borderRadius: "var(--clet-radius-base)",
          overflow: "hidden",
          background: "var(--clet-bg)",
        }}
      >
        <Sidebar variant="plain">
          <SidebarContent>
            <SidebarNav>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                {links.map(({ id, label, icon: Icon }) => (
                  <SidebarItem key={id}>
                    <SidebarLink
                      icon={<Icon size={18} strokeWidth={1.5} />}
                      active={active === id}
                      onClick={() => setActive(id)}
                    >
                      {label}
                    </SidebarLink>
                  </SidebarItem>
                ))}
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--clet-text-muted)",
            fontSize: 14,
            padding: 16,
            textAlign: "center",
          }}
        >
          Page content — plain sidebar has a transparent background and a
          right border instead of the card panel surface
        </div>
      </div>
    </SidebarProvider>
  );
}
