import { useState } from "react";
import {
  Bell,
  GitBranch,
  LayoutGrid,
  Monitor,
  Plug,
  ScrollText,
  Shield,
  Users,
  Workflow,
} from "lucide-react";
import {
  Sidebar,
  SidebarBadge,
  SidebarCollapse,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarOverlay,
  SidebarProvider,
  SidebarTrigger,
} from "@rfdtech/components";

const mainLinks = [
  { href: "#dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "#users", label: "Users", icon: Users },
  { href: "#roles", label: "Roles & Permissions", icon: Shield },
  {
    href: "#notifications",
    label: "Notification Templates",
    icon: Bell,
    badge: "New",
  },
  { href: "#workflow", label: "Workflow Parameters", icon: GitBranch },
  { href: "#integrations", label: "Integrations", icon: Plug },
] as const;

const cbtLinks = [
  { href: "#secure-browser", label: "Secure Browser Policy", icon: ScrollText },
  { href: "#exam-monitoring", label: "Exam Monitoring Settings", icon: Monitor },
] as const;

const monitoringLinks = [
  { href: "#audit-logs", label: "Audit Logs", icon: ScrollText, badge: "12" },
  { href: "#system-health", label: "System Health", icon: Workflow },
] as const;

export function SidebarExample() {
  const [activeHref, setActiveHref] = useState<string>("#users");

  return (
    <SidebarProvider>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 280px) minmax(0, 1fr)",
          gap: 24,
          alignItems: "start",
          maxWidth: "100%",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <SidebarTrigger>Open menu</SidebarTrigger>
          <SidebarOverlay />
          <Sidebar>
            <SidebarHeader>
              <div className="gsl-sidebar__header-brand">
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-flex",
                    flexShrink: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--gsl-primary-light)",
                    color: "var(--gsl-primary)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  GSL
                </span>
                <span className="gsl-sidebar__header-title">NBES</span>
              </div>
              <SidebarCollapse />
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav aria-label="Main navigation">
                <SidebarGroup>
                  {mainLinks.map(({ href, label, icon: Icon, badge }) => (
                    <SidebarItem key={href}>
                      <SidebarLink
                        href={href}
                        icon={<Icon size={20} strokeWidth={1.75} />}
                        active={activeHref === href}
                        onClick={(event) => {
                          event.preventDefault();
                          setActiveHref(href);
                        }}
                      >
                        {label}
                        {badge ? <SidebarBadge>{badge}</SidebarBadge> : null}
                      </SidebarLink>
                    </SidebarItem>
                  ))}
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupLabel>CBT Engine</SidebarGroupLabel>
                  {cbtLinks.map(({ href, label, icon: Icon }) => (
                    <SidebarItem key={href}>
                      <SidebarLink
                        href={href}
                        icon={<Icon size={20} strokeWidth={1.75} />}
                        active={activeHref === href}
                        onClick={(event) => {
                          event.preventDefault();
                          setActiveHref(href);
                        }}
                      >
                        {label}
                      </SidebarLink>
                    </SidebarItem>
                  ))}
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
                  {monitoringLinks.map(({ href, label, icon: Icon, badge }) => (
                    <SidebarItem key={href}>
                      <SidebarLink
                        href={href}
                        icon={<Icon size={20} strokeWidth={1.75} />}
                        active={activeHref === href}
                        onClick={(event) => {
                          event.preventDefault();
                          setActiveHref(href);
                        }}
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
        <div
          style={{
            minWidth: 0,
            padding: 16,
            border: "1px solid var(--gsl-border)",
            borderRadius: "var(--gsl-radius-base)",
            background: "var(--gsl-bg)",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: "var(--gsl-text-secondary)" }}>
            Main content area. On desktop, use the collapse control to switch to
            an icon-only rail. On viewports 768px and below, use the menu button
            to open the offcanvas sidebar.
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}
