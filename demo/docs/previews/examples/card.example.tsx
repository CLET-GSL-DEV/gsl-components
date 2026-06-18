import { Card } from "@rfdtech/components";

export function CardExample() {
  return (
    <div style={{ background: "var(--gsl-page-bg)", padding: 20, borderRadius: "var(--gsl-radius-xl)" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
      <Card header="Profile summary">
        <p style={{ margin: 0, fontSize: 14, color: "var(--gsl-text-secondary)", lineHeight: 1.6 }}>
          Kwame Asante is an administrator with full system access. He manages users, configurations, and reporting workflows across the platform.
        </p>
      </Card>
      <Card>
        <p style={{ margin: 0, fontSize: 14, color: "var(--gsl-text-secondary)", lineHeight: 1.6 }}>
          A card without a header — useful for wrapping standalone content like tables, charts, or forms.
        </p>
      </Card>
      <Card header="Settings" classNames={{ root: "custom-card-root" }}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--gsl-text-secondary)", lineHeight: 1.6 }}>
          Override the root class with <code>classNames.root</code> for consumer styling.
        </p>
      </Card>
    </div>
    </div>
  );
}
