import type { HTMLAttributes } from "react";

export interface DateRangeSelectorClassNames {
  root?: string;
  trigger?: string;
  calendar?: string;
  calendarHeader?: string;
  calendarNav?: string;
  calendarTitle?: string;
  calendarWeekdays?: string;
  calendarWeekday?: string;
  calendarGrid?: string;
  calendarDay?: string;
  calendarFooter?: string;
  applyButton?: string;
  cancelButton?: string;
  presets?: string;
  presetItem?: string;
  rangeSummary?: string;
}

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePreset {
  /** Rail label, e.g. "Today", "Last 7 days", "All time". */
  label: string;
  /** Computed on click — evaluated lazily so "Today"-relative presets stay accurate. */
  getRange: () => DateRangeValue;
}

export interface DateRangeSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "defaultValue"> {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
  placeholder?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
  invalid?: boolean;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  /** Optional left-rail quick-select presets (Today, Last 7 days, ...). Also shows a "Range: ..." summary in the footer when set. */
  presets?: DateRangePreset[];
  classNames?: DateRangeSelectorClassNames;
  className?: string;
}
