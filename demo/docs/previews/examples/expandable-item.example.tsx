import { ExpandableItem } from "@rfdtech/components";

export function ExpandableItemExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ExpandableItem
        title="LEAT/2026/LIC/007"
        status={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--clet-warning)",
              }}
            />
            In progress
          </span>
        }
        defaultExpanded
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Minutes of the sitting</p>
            <p
              style={{
                margin: 0,
                padding: 12,
                border: "1px solid var(--clet-border)",
                borderRadius: "var(--clet-radius-base)",
                color: "var(--clet-text-secondary)",
              }}
            >
              Nothing has been written for this sitting yet.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <div>
              <p style={{ margin: "0 0 4px", color: "var(--clet-text-secondary)" }}>
                Members Present
              </p>
              <p style={{ margin: 0 }}>0</p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", color: "var(--clet-text-secondary)" }}>
                Others Present
              </p>
              <p style={{ margin: 0 }}>0</p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", color: "var(--clet-text-secondary)" }}>
                Tendered
              </p>
              <p style={{ margin: 0 }}>0</p>
            </div>
          </div>
        </div>
      </ExpandableItem>
      <ExpandableItem title="LEAT/2026/LIC/007" status="closed">
        <p style={{ margin: 0 }}>This case is closed.</p>
      </ExpandableItem>
    </div>
  );
}
