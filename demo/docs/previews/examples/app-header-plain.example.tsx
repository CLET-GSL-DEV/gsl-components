import {
  AppHeader,
  AppHeaderActions,
  AppHeaderBranding,
  AppHeaderNotifications,
  AppHeaderProfile,
  AppSwitcher,
} from "@rfdtech/components";

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
  },
];

const notifications = [
  { id: "1", text: "A new member joined the Ghana chapter.", time: "2m ago", unread: true },
  { id: "2", text: "Your monthly report is ready.", time: "1h ago", unread: false },
];

export function AppHeaderPlainExample() {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: "var(--gsl-radius-2xl)",
        background: "var(--gsl-surface-subtle)",
      }}
    >
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
    </div>
  );
}
