import { DateRangeSelector } from "@rfdtech/components";

export function DateRangeSelectorExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}>
      <DateRangeSelector
        onChange={(range) => console.log(range)}
      />
      <DateRangeSelector invalid placeholder="Pick dates" />
      <DateRangeSelector disabled />
    </div>
  );
}
