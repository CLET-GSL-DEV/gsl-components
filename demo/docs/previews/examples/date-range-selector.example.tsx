import { useState } from "react";
import { DateRangeSelector } from "@rfdtech/components";
import type { DateRangeValue } from "@rfdtech/components";

export function DateRangeSelectorExample() {
  const [range, setRange] = useState<DateRangeValue>({ start: null, end: null });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
      <DateRangeSelector value={range} onChange={setRange} />
      <div style={{ display: "flex", gap: 8 }}>
        <DateRangeSelector invalid placeholder={{ start: "From", end: "To" }} />
        <DateRangeSelector disabled />
      </div>
      {range.start && range.end && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--gsl-text-secondary)" }}>
          Selected: {range.start.toLocaleDateString()} — {range.end.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
