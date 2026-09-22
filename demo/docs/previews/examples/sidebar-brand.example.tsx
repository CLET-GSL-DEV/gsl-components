import { useState } from "react";
import { Gauge, Home } from "lucide-react";
import {
  Sidebar,
  SidebarBrand,
  SidebarCollapse,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarProvider,
} from "@rfdtech/components";

const links = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "journey", label: "Accreditation Journey", icon: Gauge },
  { id: "home", label: "Home", icon: Home },
] as const;

export function SidebarBrandExample() {
  const [active, setActive] = useState<string>("journey");

  return (
    <SidebarProvider>
      <div
        style={{
          display: "flex",
          height: 360,
          borderRadius: "var(--clet-radius-base)",
          overflow: "hidden",
          background: "var(--clet-bg)",
        }}
      >
        <Sidebar variant="brand">
          <SidebarHeader>
            <SidebarBrand
              logo={
                <img src="/clet-logo-vertical.png" alt="CLET" />
              }
            />
            <SidebarCollapse />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav>
              <SidebarGroup collapsible>
                <SidebarGroupLabel>Overview</SidebarGroupLabel>
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
          Page content: the 2.4 brand rail with the mosaic image, image-only
          header, and white active item
        </div>
      </div>
    </SidebarProvider>
  );
}
