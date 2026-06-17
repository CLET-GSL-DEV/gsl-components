import { DateSelector } from "@rfdtech/components";

export function DateSelectorExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
      <DateSelector />
      <DateSelector invalid />
      <DateSelector disabled />
    </div>
  );
}
