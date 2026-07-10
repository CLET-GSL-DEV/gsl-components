import { useState } from "react";
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderSearch,
  AppHeaderNotifications,
  AppHeaderProfile,
  AppSwitcher,
} from "@rfdtech/components";
import type { AppHeaderSearchDataGroup } from "@rfdtech/components";

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
    href: "https://portal.example.com",
  },
  {
    id: "finance-hub",
    name: "Finance Hub",
    icon: "https://ui-avatars.com/api/?name=Finance+Hub&background=047857&color=fff&size=96",
    href: "https://finance.example.com",
  },
  {
    id: "hr-suite",
    name: "HR Suite",
    icon: "https://ui-avatars.com/api/?name=HR+Suite&background=7c3aed&color=fff&size=96",
  },
];

const notifications = [
  { id: "1", text: "A new member joined the Ghana chapter.", time: "2m ago", unread: true },
  { id: "2", text: "Your monthly report is ready.", time: "1h ago", unread: true },
  { id: "3", text: "System maintenance scheduled for 2:00 AM.", time: "3h ago", unread: false },
];

export function AppHeaderExample() {
  const [search, setSearch] = useState("");
  const [profileVariant, setProfileVariant] = useState<
    "full" | "basic" | "avatar"
  >("full");

  const nextProfileVariant = (
    { full: "basic", basic: "avatar", avatar: "full" } as const
  )[profileVariant];

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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AppHeader>
        <AppHeaderSearch
          data={searchGroups}
          onSearch={setSearch}
          showEmpty
          placeholder="Search members, projects…"
        />
        <AppHeaderActions>
          <AppSwitcher apps={apps} />
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
          <AppHeaderProfile user={user} variant={profileVariant}>
            <button
              type="button"
              className="gsl-profile-popover__action"
              onClick={() => setProfileVariant(nextProfileVariant)}
            >
              <span className="gsl-profile-popover__action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="12" cy="10" r="3" />
                  <path d="M17 21v-2a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v2" />
                </svg>
              </span>
              <span className="gsl-profile-popover__action-label">
                Switch to {nextProfileVariant}
              </span>
            </button>
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
      <div
        style={{
          height: 120,
          borderRadius: "var(--gsl-radius-2xl)",
          background: "var(--gsl-surface-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "var(--gsl-text-muted)",
          border: "1px dashed var(--gsl-border)",
        }}
      >
        Page content goes here
      </div>
    </div>
  );
}
