import { AppHeader, AppHeaderBranding, Badge } from "@rfdtech/components";

export function AppHeaderBrandingDeclarativeExample() {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: "var(--clet-radius-2xl)",
        background: "var(--clet-surface-subtle)",
      }}
    >
      <AppHeader variant="plain">
        <AppHeaderBranding
          logo={
            <img
              src="/clet-logo.png"
              alt=""
              width={28}
              height={28}
              className="demo-home__sidebar-logo"
            />
          }
        >
          <span className="clet-app-header__branding-text">
            <span className="clet-app-header__branding-title">CLET PORTAL</span>
            <Badge variant="outline">Beta</Badge>
          </span>
        </AppHeaderBranding>
      </AppHeader>
    </div>
  );
}
