import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@rfdtech/components";
import type { AppHeaderSearchDataGroup } from "@rfdtech/components";
import { demoApps } from "demo/data/demoApps";
import { demoNotifications } from "demo/data/demoNotifications";
import { useMockQuery } from "demo/hooks/useMockQuery";
import { buildPageItems, buildMemberItems } from "demo/data/demoSearch";

import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  FileText,
  BarChart3,
  ClipboardList,
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
  Check,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  SidebarBadge,
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
} from "@rfdtech/components";

export function DemoLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  const { data: appsData, loading: appsLoading } = useMockQuery(demoApps, 2000);
  const { data: notifData, loading: notifLoading } = useMockQuery(
    demoNotifications,
    1500,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback(
    (value: string) => setSearchQuery(value),
    [],
  );

  // ── Segmented search: each group has its own loading state ──
  const pagesQuery = useMemo(() => buildPageItems(searchQuery), [searchQuery]);
  const membersQuery = useMemo(() => buildMemberItems(searchQuery), [searchQuery]);

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
    ];
  }, [searchQuery, pageResults, pagesLoading, memberResults, membersLoading]);

  const navGroups = [
    {
      label: "Main",
      links: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
          badge: "check",
        },
        {
          id: "members",
          label: "Members",
          href: "/members",
          icon: Users,
          badge: "check",
        },
        {
          id: "exams",
          label: "Examinations",
          href: "#",
          icon: ClipboardList,
          badge: "New",
        },
        {
          id: "candidates",
          label: "Candidates",
          href: "#",
          icon: GraduationCap,
          badge: "142",
        },
        {
          id: "institutions",
          label: "Institutions",
          href: "#",
          icon: Building2,
          badge: "12",
        },
      ],
    },
    {
      label: "Assessment",
      links: [
        {
          id: "item-bank",
          label: "Item Bank",
          href: "#",
          icon: BookOpen,
          badge: "843",
        },
        {
          id: "moderation",
          label: "Moderation",
          href: "#",
          icon: Shield,
          badge: "4",
        },
        {
          id: "results",
          label: "Results",
          href: "#",
          icon: FileText,
          badge: "New",
        },
        {
          id: "certificates",
          label: "Certificates",
          href: "#",
          icon: ScrollText,
        },
      ],
    },
    {
      label: "Management",
      links: [
        { id: "roles", label: "Roles & Access", href: "#", icon: Key },
        { id: "permissions", label: "Permissions", href: "#", icon: Shield },
        { id: "audit", label: "Audit Trail", href: "#", icon: Database },
        {
          id: "billing",
          label: "Billing",
          href: "#",
          icon: CreditCard,
          badge: "Beta",
        },
        { id: "archives", label: "Archives", href: "#", icon: Archive },
      ],
    },
    {
      label: "Analytics",
      links: [
        { id: "overview", label: "Overview", href: "#", icon: BarChart3 },
        {
          id: "reports",
          label: "Reports",
          href: "#",
          icon: FileText,
          badge: "3",
        },
        { id: "alerts", label: "Alerts", href: "#", icon: Bell, badge: "8" },
        {
          id: "messages",
          label: "Messages",
          href: "#",
          icon: MessageSquare,
          badge: "5",
        },
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
        {
          id: "regions",
          label: "Regions",
          href: "#",
          icon: Globe,
          badge: "Soon",
        },
      ],
    },
  ];

  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const check = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight + 2;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
      setShowScrollHint(hasOverflow && !atBottom);
      setScrolledToBottom(atBottom);
      setScrolledDown(el.scrollTop > 60);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, []);

  const handleScrollDown = useCallback(() => {
    contentRef.current?.scrollBy({ top: 200, behavior: "smooth" });
  }, []);

  return (
    <SidebarProvider>
      <AppLayout>
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
                onClick={() => navigate("/docs")}
              >
                <span className="gsl-profile-popover__action-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <span className="gsl-profile-popover__action-label">Docs</span>
              </button>
              <button
                type="button"
                className="gsl-profile-popover__action"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                <span className="gsl-profile-popover__action-icon">
                  {resolvedTheme === "dark" ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </span>
                <span className="gsl-profile-popover__action-label">
                  {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                </span>
              </button>
              <button
                type="button"
                className="gsl-profile-popover__action gsl-profile-popover__action--danger"
              >
                <span className="gsl-profile-popover__action-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                <span className="gsl-profile-popover__action-label">
                  Sign out
                </span>
              </button>
            </AppHeaderProfile>
          </AppHeaderActions>
        </AppHeader>
        <AppSidebar>
          <Sidebar>
            <SidebarHeader>
              <div className="demo-home__sidebar-brand">
                <img
                  src="/gsl-logo.png"
                  alt=""
                  width={28}
                  height={28}
                  className="demo-home__sidebar-logo"
                />
                <span className="demo-home__sidebar-title">GSL</span>
              </div>
            </SidebarHeader>
            <SidebarContent
              ref={contentRef}
              className={
                scrolledDown ? "gsl-sidebar__content--scrolled" : undefined
              }
            >
              <SidebarNav>
                {navGroups.map((group) => (
                  <SidebarGroup key={group.label}>
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    {group.links.map((link) => {
                      const Icon = link.icon;
                      const isCurrent = location.pathname === link.href;
                      return (
                        <SidebarLink
                          key={link.id}
                          active={isCurrent}
                          icon={<Icon size={18} strokeWidth={1.5} />}
                          href={link.href}
                          onClick={(e) => {
                            if (link.href === "#") e.preventDefault();
                          }}
                        >
                          {link.label}
                          {link.badge && (
                            <SidebarBadge>
                              {link.badge === "check" ? (
                                <Check size={12} strokeWidth={2.5} />
                              ) : (
                                link.badge
                              )}
                            </SidebarBadge>
                          )}
                        </SidebarLink>
                      );
                    })}
                  </SidebarGroup>
                ))}
              </SidebarNav>
            </SidebarContent>
            {showScrollHint && (
              <button
                type="button"
                className="gsl-sidebar__scroll-hint"
                onClick={handleScrollDown}
                aria-label="Scroll down"
              >
                <ChevronDown size={16} strokeWidth={2} />
              </button>
            )}
            <SidebarFooter>
              <button type="button" className="demo-home__sidebar-footer-btn">
                <Settings size={18} strokeWidth={1.5} />
                <span>Settings</span>
                <ChevronRight
                  size={16}
                  strokeWidth={1.5}
                  className="demo-home__sidebar-footer-chevron"
                />
              </button>
            </SidebarFooter>
          </Sidebar>
        </AppSidebar>
        <AppBody>
          <Outlet />
        </AppBody>
      </AppLayout>
    </SidebarProvider>
  );
}
