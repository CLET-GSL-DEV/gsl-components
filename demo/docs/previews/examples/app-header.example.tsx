import { useState } from "react";
import {
  AppHeader,
  AppHeaderSearch,
  AppHeaderNotifications,
  AppHeaderProfile,
  AppSwitcher,
} from "@rfdtech/components";
import type { AppHeaderSearchDataGroup } from "@rfdtech/components";

const fakeUser = {
  name: "Kwame Asante",
  role: "Admin",
  initials: "KA",
  email: "kwame@gsl.edu.gh",
};

const fakeApps = [
  { id: "dashboard", name: "Dashboard", icon: "📊" },
  { id: "members", name: "Members", icon: "👥" },
  { id: "settings", name: "Settings", icon: "⚙️" },
  { id: "billing", name: "Billing", icon: "💳" },
];

const fakeNotifications = [
  { id: "1", text: "A new member joined the Ghana chapter.", time: "2m ago", unread: true },
  { id: "2", text: "Your monthly report is ready.", time: "1h ago", unread: true },
  { id: "3", text: "System maintenance scheduled for 2:00 AM.", time: "3h ago", unread: false },
];

export function AppHeaderExample() {
  const [search, setSearch] = useState("");
  const [profileVariant, setProfileVariant] = useState<"full" | "basic">("full");

  const searchGroups: AppHeaderSearchDataGroup[] = search
    ? [
        {
          heading: "Members",
          items: [
            { value: "kwame-asante", label: "Kwame Asante", onSelect: () => alert("Selected Kwame") },
            { value: "abena-mensah", label: "Abena Mensah", onSelect: () => alert("Selected Abena") },
          ],
        },
        {
          heading: "Projects",
          items: [
            { value: "gsl-platform", label: "GSL Platform", onSelect: () => alert("Selected project") },
          ],
        },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AppHeader
        search={
          <AppHeaderSearch
            data={searchGroups}
            onSearch={setSearch}
            showEmpty
            placeholder="Search members, projects…"
          />
        }
        appSwitcher={<AppSwitcher apps={fakeApps} />}
        notifications={
          <AppHeaderNotifications>
            {fakeNotifications.map((n) => (
              <div key={n.id} className="gsl-notif-popover__item">
                {n.unread && <div className="gsl-notif-popover__dot" />}
                <div className="gsl-notif-popover__body">
                  <div className="gsl-notif-popover__body-text">{n.text}</div>
                  <div className="gsl-notif-popover__body-time">{n.time}</div>
                </div>
              </div>
            ))}
          </AppHeaderNotifications>
        }
        profile={
          <AppHeaderProfile user={fakeUser} variant={profileVariant}>
            <button
              type="button"
              className="gsl-profile-popover__action"
              onClick={() =>
                setProfileVariant(profileVariant === "full" ? "basic" : "full")
              }
            >
              <span className="gsl-profile-popover__action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="12" cy="10" r="3" />
                  <path d="M17 21v-2a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v2" />
                </svg>
              </span>
              <span className="gsl-profile-popover__action-label">
                {profileVariant === "full" ? "Switch to basic" : "Switch to full"}
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
        }
      />
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
