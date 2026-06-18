import type { HTMLAttributes } from "react";

export interface DateRangeSelectorClassNames {
  root?: string;
  field?: string;
  fieldLabel?: string;
  trigger?: string;
  calendar?: string;
}

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

export interface DateRangeSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "defaultValue"> {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
  placeholder?: { start?: string; end?: string };
  invalid?: boolean;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  classNames?: DateRangeSelectorClassNames;
  className?: string;
}
