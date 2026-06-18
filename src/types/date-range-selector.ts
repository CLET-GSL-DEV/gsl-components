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
}

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
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
  classNames?: DateRangeSelectorClassNames;
  className?: string;
}
