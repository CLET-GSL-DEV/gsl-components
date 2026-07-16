import { useState } from "react";
import { MetricCard } from "@rfdtech/components";
import { Users, UserCheck, Activity } from "lucide-react";

export function MetricCardLoadingExample() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        className="clet-profile-menu__item"
        style={{ alignSelf: "flex-start" }}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1500);
        }}
      >
        <span>Simulate loading</span>
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <div style={{ minWidth: 200, flex: 1 }}>
          <MetricCard
            loading={loading}
            label="Revenue"
            value="$128.4k"
            icon={<Users size={16} strokeWidth={1.5} />}
            description="Total revenue this quarter"
            trend="up"
            trendValue="+12.5%"
          />
        </div>
        <div style={{ minWidth: 200, flex: 1 }}>
          <MetricCard
            loading={loading}
            label="Active users"
            value="2,847"
            icon={<UserCheck size={16} strokeWidth={1.5} />}
            description="Current active users"
            trend="down"
            trendValue="-3.2%"
          />
        </div>
        <div style={{ minWidth: 200, flex: 1 }}>
          <MetricCard
            loading={loading}
            label="Avg response"
            value="1.2s"
            icon={<Activity size={16} strokeWidth={1.5} />}
            description="Average API response time"
          />
        </div>
      </div>
    </div>
  );
}
