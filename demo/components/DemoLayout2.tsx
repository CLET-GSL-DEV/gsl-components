import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@rfdtech/components";
import type { AppHeaderSearchDataGroup } from "@rfdtech/components";
import { demoApps } from "demo/data/demoApps";
import { demoNotifications } from "demo/data/demoNotifications";
import { useMockQuery } from "demo/hooks/useMockQuery";
import { buildPageItems, buildMemberItems, buildDocItems } from "demo/data/demoSearch";
import { packageVersion } from "demo/docs/site-meta";

import {
  LayoutDashboard,
  Users,
  ChevronRight,
  FileText,
  BarChart3,
  Shield,
  Bell,
  HelpCircle,
  Key,
  ScrollText,
  GraduationCap,
  BookOpen,
  Building2,
  Globe,
  Database,
  Webhook,
  Terminal,
  CreditCard,
  Archive,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarCollapse,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  SidebarBadge,
  SidebarBrand,
  AppHeader,
  AppHeaderActions,
  AppHeaderSearch,
  AppHeaderNotifications,
  AppHeaderProfile,
  AppSwitcher,
  AppLayout,
  AppSidebar,
  AppBody,
  SidebarProvider,
  BreadcrumbProvider,
  useBreadcrumbs,
} from "@rfdtech/components";

/** Sets breadcrumbs for the Dashboard 2 layout */
function BreadcrumbSetter() {
  useBreadcrumbs([{ label: "Home", href: "/" }, { label: "Dashboard 2" }]);
  return null;
}

export function DemoLayout2() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  const { data: appsData, loading: appsLoading } = useMockQuery(demoApps, 2000);
  const { data: notifData, loading: notifLoading } = useMockQuery(
    demoNotifications,
    1500,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((value: string) => setSearchQuery(value), []);

  // ── Segmented search: each group has its own loading state ──
  const pagesQuery = useMemo(() => buildPageItems(searchQuery), [searchQuery]);
  const membersQuery = useMemo(
    () => buildMemberItems(searchQuery),
    [searchQuery],
  );
  const docsQuery = useMemo(() => buildDocItems(searchQuery), [searchQuery]);

  const { data: pageResults, loading: pagesLoading } = useMockQuery(
    pagesQuery,
    2000,
    `${searchQuery}-pages`,
  );
  const { data: memberResults, loading: membersLoading } = useMockQuery(
    membersQuery,
    2000,
    `${searchQuery}-members`,
  );
  const { data: docsResults, loading: docsLoading } = useMockQuery(
    docsQuery,
    300,
    `${searchQuery}-docs`,
  );

  const searchGroups: AppHeaderSearchDataGroup[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return [
      {
        heading: "Pages",
        items: pageResults ?? [],
        loading: pagesLoading,
        loadingLabel: "Searching pages...",
      },
      {
        heading: "Members",
        items: memberResults ?? [],
        loading: membersLoading,
        loadingLabel: "Searching members...",
      },
      {
        heading: "Documentation",
        items: (docsResults ?? []).map((doc) => ({
          ...doc,
          onSelect: () => {
            navigate(`/docs/${doc.value}`);
            setSearchQuery("");
          },
        })),
        loading: docsLoading,
        loadingLabel: "Searching documentation...",
      },
    ];
  }, [searchQuery, pageResults, pagesLoading, memberResults, membersLoading, docsResults, docsLoading, navigate]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(["Main"]),
  );

  useEffect(() => {
    setExpandedGroups((prev) => {
      if (prev.has("Main")) return prev;
      const next = new Set(prev);
      next.add("Main");
      return next;
    });
  }, []);

  const handleGroupToggle = useCallback((label: string, expanded: boolean) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (expanded) {
        next.add(label);
      } else {
        next.delete(label);
      }
      return next;
    });
  }, []);

  const navGroups = [
    {
      label: "Main",
      links: [
        { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
        { id: "dashboard2", label: "Dashboard 2", href: "/dashboard2", icon: LayoutDashboard },
        { id: "members", label: "Members", href: "/members", icon: Users },
        { id: "docs", label: "Documentation", href: "/docs", icon: BookOpen, badge: "New" },
        { id: "candidates", label: "Candidates", href: "#", icon: GraduationCap },
        { id: "institutions", label: "Institutions", href: "#", icon: Building2 },
      ],
    },
    {
      label: "Assessment",
      links: [
        { id: "item-bank", label: "Item Bank", href: "#", icon: BookOpen },
        { id: "moderation", label: "Moderation", href: "#", icon: Shield },
        { id: "results", label: "Results", href: "#", icon: FileText },
        { id: "certificates", label: "Certificates", href: "#", icon: ScrollText },
      ],
    },
    {
      label: "Management",
      links: [
        { id: "roles", label: "Roles & Access", href: "#", icon: Key },
        { id: "permissions", label: "Permissions", href: "#", icon: Shield },
        { id: "audit", label: "Audit Trail", href: "#", icon: Database },
        { id: "billing", label: "Billing", href: "#", icon: CreditCard },
        { id: "archives", label: "Archives", href: "#", icon: Archive },
      ],
    },
    {
      label: "Analytics",
      links: [
        { id: "overview", label: "Overview", href: "#", icon: BarChart3 },
        { id: "reports", label: "Reports", href: "#", icon: FileText },
        { id: "alerts", label: "Alerts", href: "#", icon: Bell, badge: "8" },
        { id: "messages", label: "Messages", href: "#", icon: MessageSquare },
      ],
    },
    {
      label: "Developer",
      links: [
        { id: "api-keys", label: "API Keys", href: "#", icon: Terminal },
        { id: "webhooks", label: "Webhooks", href: "#", icon: Webhook },
        { id: "logs", label: "System Logs", href: "#", icon: Database },
      ],
    },
    {
      label: "Other",
      links: [
        { id: "help", label: "Help Center", href: "#", icon: HelpCircle },
        { id: "regions", label: "Regions", href: "#", icon: Globe },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <AppLayout variant="stacked">
          <AppHeader>
            <AppHeaderSearch
              data={searchGroups}
              onSearch={handleSearch}
              showEmpty
              placeholder="Search pages and members..."
            />
            <AppHeaderActions>
              <button
                type="button"
                className="gsl-app-header__notif-btn"
                aria-label="Documentation"
                onClick={() => navigate("/docs")}
              >
                <BookOpen size={18} strokeWidth={1.5} aria-hidden />
              </button>
              <AppSwitcher
                apps={appsData ?? []}
                loading={appsLoading}
                title="System directory"
                onAppSelect={(app) => console.log("Selected:", app.name)}
              />
              <AppHeaderNotifications loading={notifLoading}>
                {notifData?.map((n: (typeof notifData)[number]) => (
                  <div
                    key={n.id}
                    className={`gsl-notif-popover__item${!n.unread ? " gsl-notif-popover__item--read" : ""}`}
                  >
                    {n.unread && <div className="gsl-notif-popover__dot" />}
                    <div className="gsl-notif-popover__body">
                      <div className="gsl-notif-popover__body-text">{n.text}</div>
                      <div className="gsl-notif-popover__body-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </AppHeaderNotifications>
              <AppHeaderProfile
                variant="basic"
                user={{
                  name: "Kwame Asante",
                  role: "Admin",
                  initials: "KA",
                  email: "kwame@gsl.edu.gh",
                }}
              >
                <button
                  type="button"
                  className="gsl-profile-popover__action"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  <span className="gsl-profile-popover__action-label">
                    {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                  </span>
                </button>
              </AppHeaderProfile>
            </AppHeaderActions>
          </AppHeader>
          <AppSidebar>
            <Sidebar>
              <SidebarHeader>
                <SidebarBrand>
                  <img
                    src="/gsl-logo.png"
                    alt=""
                    width={28}
                    height={28}
                    className="demo-home__sidebar-logo"
                  />
                  <span className="demo-home__sidebar-title">GSL</span>
                  <span className="demo-home__sidebar-version">
                    v{packageVersion}
                  </span>
                </SidebarBrand>
                <SidebarTrigger>Menu</SidebarTrigger>
                <SidebarCollapse />
              </SidebarHeader>
              <SidebarContent>
                <SidebarNav>
                  {navGroups.map((group) => (
                    <SidebarGroup
                      key={group.label}
                      collapsible
                      expanded={expandedGroups.has(group.label)}
                      onExpandedChange={(expanded) =>
                        handleGroupToggle(group.label, expanded)
                      }
                    >
                      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                      {group.links.map((link) => {
                        const Icon = link.icon;
                        const isCurrent = location.pathname === link.href;
                        return (
                          <SidebarLink
                            key={link.id}
                            active={isCurrent}
                            icon={<Icon size={18} strokeWidth={1.5} />}
                            onClick={() => {
                              if (link.href !== "#") navigate(link.href);
                            }}
                          >
                            {link.label}
                            {link.badge && <SidebarBadge>{link.badge}</SidebarBadge>}
                          </SidebarLink>
                        );
                      })}
                    </SidebarGroup>
                  ))}
                </SidebarNav>
              </SidebarContent>
              <SidebarFooter>
                <button
                  type="button"
                  className="demo-home__sidebar-footer-btn"
                  onClick={() => navigate("/")}
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                  <span>Back to main dashboard</span>
                </button>
              </SidebarFooter>
            </Sidebar>
          </AppSidebar>
          <BreadcrumbSetter />
          <AppBody>
            <Outlet />
          </AppBody>
        </AppLayout>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}
