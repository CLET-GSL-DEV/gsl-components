import { AppHeader, AppHeaderBranding, Badge } from "@rfdtech/components";

export function AppHeaderBrandingDeclarativeExample() {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: "var(--gsl-radius-2xl)",
        background: "var(--gsl-surface-subtle)",
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
          <span className="gsl-app-header__branding-text">
            <span className="gsl-app-header__branding-title">GSL PORTAL</span>
            <Badge variant="outline">Beta</Badge>
          </span>
        </AppHeaderBranding>
      </AppHeader>
    </div>
  );
}
