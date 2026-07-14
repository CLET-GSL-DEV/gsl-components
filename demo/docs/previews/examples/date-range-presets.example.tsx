import { DateRangeSelector } from "@rfdtech/components";
import type { DateRangePreset, DateRangeValue } from "@rfdtech/components";
import { useState } from "react";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysAgo(count: number) {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - count);
  return d;
}

function monthsAgo(count: number) {
  const d = startOfDay(new Date());
  d.setMonth(d.getMonth() - count);
  return d;
}

const presets: DateRangePreset[] = [
  { label: "Today", getRange: () => ({ start: startOfDay(new Date()), end: startOfDay(new Date()) }) },
  { label: "Last 7 days", getRange: () => ({ start: daysAgo(7), end: startOfDay(new Date()) }) },
  { label: "Last 30 days", getRange: () => ({ start: daysAgo(30), end: startOfDay(new Date()) }) },
  { label: "Last 3 months", getRange: () => ({ start: monthsAgo(3), end: startOfDay(new Date()) }) },
  { label: "Last 12 months", getRange: () => ({ start: monthsAgo(12), end: startOfDay(new Date()) }) },
  {
    label: "Month to date",
    getRange: () => {
      const now = new Date();
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: startOfDay(now) };
    },
  },
  {
    label: "Year to date",
    getRange: () => {
      const now = new Date();
      return { start: new Date(now.getFullYear(), 0, 1), end: startOfDay(now) };
    },
  },
  { label: "All time", getRange: () => ({ start: null, end: null }) },
];

export function DateRangePresetsExample() {
  const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });

  return (
    <DateRangeSelector value={value} onChange={setValue} presets={presets} />
  );
}
