import { Card, CardHeader, CardTitle, CardActions } from "@rfdtech/components";

export function CardExample() {
  return (
    <div
      style={{
        background: "var(--gsl-surface-subtle)",
        padding: 20,
        borderRadius: "var(--gsl-radius-xl)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 480,
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile summary</CardTitle>
            <CardActions>
              <button
                style={{
                  padding: "4px 12px",
                  fontSize: 12,
                  border: "1px solid var(--gsl-border)",
                  borderRadius: "var(--gsl-radius)",
                  background: "var(--gsl-bg)",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
            </CardActions>
          </CardHeader>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "var(--gsl-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            Kwame Asante is an administrator with full system access.
          </p>
        </Card>
        <Card>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "var(--gsl-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            A card without a header, useful for wrapping standalone content like
            tables or text.
          </p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "var(--gsl-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            Header with title only, no actions. Use <code>className</code> for
            root overrides.
          </p>
        </Card>
      </div>
    </div>
  );
}
