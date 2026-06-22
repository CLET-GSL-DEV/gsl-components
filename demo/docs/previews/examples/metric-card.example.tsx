import { MetricCard } from "@rfdtech/components";

export function MetricCardExample() {
  return (
    <div style={{ background: "var(--gsl-page-bg)", padding: 20, borderRadius: "var(--gsl-radius-xl)" }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <div style={{ minWidth: 200, flex: 1 }}>
        <MetricCard
          label="Revenue"
          value="$128.4k"
          description="Total revenue this quarter"
          trend="up"
          trendValue="+12.5%"
          animate
        />
      </div>
      <div style={{ minWidth: 200, flex: 1 }}>
        <MetricCard
          label="Active users"
          value="2,847"
          description="Current active users"
          trend="down"
          trendValue="-3.2%"
          animate
        />
      </div>
      <div style={{ minWidth: 200, flex: 1 }}>
        <MetricCard
          label="Avg response"
          value="1.2s"
          description="Average API response time"
          animate
        />
      </div>
    </div>
    </div>
  );
}
