import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type {
  DateRangeSelectorProps,
  DateRangeValue,
} from "../../types/date-range-selector";

export type { DateRangeValue };
import { Button } from "../button";
import { Dropdown } from "../dropdown";
import type { DropdownOption } from "../../types/dropdown";
import { cn } from "../../utils/cn";
import "./styles/date-range-selector.css";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateInRange(date: Date, min?: Date, max?: Date): boolean {
  if (min) {
    const minDay = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    if (date < minDay) return false;
  }
  if (max) {
    const maxDay = new Date(max.getFullYear(), max.getMonth(), max.getDate());
    if (date > maxDay) return false;
  }
  return true;
}

function isInSelectedRange(
  day: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) return false;
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return d > s && d < e;
}

function computeCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDow = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const days: Date[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  const remainder = days.length % 7;
  if (remainder > 0) {
    for (let i = 1; i <= 7 - remainder; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }

  return days;
}

interface MonthPanelProps {
  year: number;
  month: number;
  pendingRange: DateRangeValue;
  today: Date;
  min?: Date;
  max?: Date;
  disabled: boolean;
  classNames?: DateRangeSelectorProps["classNames"];
  onSelect: (day: Date) => void;
}

function MonthPanel({
  year,
  month,
  pendingRange,
  today,
  min,
  max,
  disabled,
  classNames,
  onSelect,
}: MonthPanelProps) {
  const calendarDays = useMemo(
    () => computeCalendarDays(year, month),
    [year, month],
  );

  const monthLabel = useMemo(() => {
    const d = new Date(year, month, 1);
    return d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [year, month]);

  return (
    <div className="gsl-date-selector__month-panel">
      <div
        className={cn(
          "gsl-date-selector__calendar-title",
          classNames?.calendarTitle,
        )}
      >
        {monthLabel}
      </div>

      <div
        className={cn(
          "gsl-date-selector__calendar-weekdays",
          classNames?.calendarWeekdays,
        )}
        role="row"
      >
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className={cn(
              "gsl-date-selector__calendar-weekday",
              classNames?.calendarWeekday,
            )}
            role="columnheader"
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "gsl-date-selector__calendar-grid",
          classNames?.calendarGrid,
        )}
        role="grid"
      >
        {calendarDays.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const isStart = pendingRange.start
            ? isSameDay(day, pendingRange.start)
            : false;
          const isEnd = pendingRange.end
            ? isSameDay(day, pendingRange.end)
            : false;
          const inRange = isInSelectedRange(
            day,
            pendingRange.start,
            pendingRange.end,
          );
          const isDisabled = disabled || !isDateInRange(day, min, max);

          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              disabled={isDisabled || !isCurrentMonth}
              aria-selected={isStart || isEnd}
              aria-label={day.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              className={cn(
                "gsl-date-selector__calendar-day",
                !isCurrentMonth &&
                  "gsl-date-selector__calendar-day--outside",
                isToday && "gsl-date-selector__calendar-day--today",
                isStart && "gsl-date-selector__calendar-day--selected",
                isEnd && "gsl-date-selector__calendar-day--selected",
                inRange &&
                  "gsl-date-selector__calendar-day--in-range",
                classNames?.calendarDay,
              )}
              onClick={() => onSelect(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const monthOptions: DropdownOption[] = MONTHS.map((name, idx) => ({
  value: String(idx),
  label: name,
}));

export const DateRangeSelector = forwardRef<
  HTMLDivElement,
  DateRangeSelectorProps
>(function DateRangeSelector(
  {
    value: controlledValue,
    defaultValue,
    onChange,
    placeholder = "Select date range",
    invalid = false,
    disabled = false,
    min,
    max,
    formatOptions,
    classNames,
    className,
  },
  ref,
) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<DateRangeValue>(
    defaultValue ?? { start: null, end: null },
  );
  const range = isControlled ? (controlledValue ?? { start: null, end: null }) : internalValue;

  const [open, setOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRangeValue>({ start: null, end: null });

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [leftMonth, setLeftMonth] = useState(today.getMonth());

  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
  const rightYear = leftMonth === 11 ? viewYear + 1 : viewYear;

  const formatDate = useCallback(
    (date: Date | null) =>
      date
        ? date.toLocaleDateString("en-US", formatOptions ?? DEFAULT_FORMAT)
        : "",
    [formatOptions],
  );

  const displayText = useMemo(() => {
    if (!range.start && !range.end) return "";
    const from = range.start ? formatDate(range.start) : "...";
    const to = range.end ? formatDate(range.end) : "...";
    return `${from} \u2014 ${to}`;
  }, [range, formatDate]);

  const setRange = useCallback(
    (next: DateRangeValue) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const hasSelection = pendingRange.start !== null;

  const handleSelect = useCallback(
    (day: Date) => {
      if (disabled) return;
      if (!isDateInRange(day, min, max)) return;
      const normalized = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
      );

      if (!pendingRange.start) {
        setPendingRange({ start: normalized, end: null });
      } else if (!pendingRange.end) {
        if (normalized < pendingRange.start) {
          setPendingRange({ start: normalized, end: pendingRange.start });
        } else {
          setPendingRange({ start: pendingRange.start, end: normalized });
        }
      } else {
        setPendingRange({ start: normalized, end: null });
      }
    },
    [disabled, min, max, pendingRange],
  );

  const handleApply = useCallback(() => {
    setRange(pendingRange);
    setOpen(false);
  }, [pendingRange, setRange]);

  const handleCancel = useCallback(() => {
    setPendingRange(range);
    setOpen(false);
  }, [range]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (next) {
        const refDate = range.start ?? today;
        setViewYear(refDate.getFullYear());
        setLeftMonth(refDate.getMonth());
        setPendingRange(range);
      }
      setOpen(next);
    },
    [disabled, range, today],
  );

  const prevMonth = useCallback(() => {
    setLeftMonth((m) => (m === 0 ? 11 : m - 1));
    if (leftMonth === 0) setViewYear((y) => y - 1);
  }, [leftMonth]);

  const nextMonth = useCallback(() => {
    setLeftMonth((m) => (m === 11 ? 0 : m + 1));
    if (leftMonth === 11) setViewYear((y) => y + 1);
  }, [leftMonth]);

  const yearDropdownOptions: DropdownOption[] = useMemo(() => {
    const current = today.getFullYear();
    const years: DropdownOption[] = [];
    for (let y = current - 10; y <= current + 10; y++) {
      years.push({ value: String(y), label: String(y) });
    }
    return years;
  }, [today]);

  return (
    <div
      ref={ref}
      className={cn(
        "gsl-date-range-selector",
        invalid && "gsl-date-range-selector--invalid",
        disabled && "gsl-date-range-selector--disabled",
        classNames?.root,
        className,
      )}
    >
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "gsl-date-selector__trigger",
              !range.start && !range.end && "gsl-date-selector__trigger--placeholder",
              classNames?.trigger,
            )}
            aria-invalid={invalid || undefined}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <Calendar
              size={16}
              strokeWidth={1.75}
              className="gsl-date-selector__trigger-icon"
              aria-hidden
            />
            <span className="gsl-date-selector__trigger-text">
              {range.start || range.end ? displayText : placeholder}
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={cn(
              "gsl-date-selector__calendar",
              "gsl-date-selector__calendar--double",
              classNames?.calendar,
            )}
            side="bottom"
            align="start"
            sideOffset={4}
            aria-label="Date range picker"
          >
            <div
              className={cn(
                "gsl-date-selector__calendar-header",
                classNames?.calendarHeader,
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(classNames?.calendarNav)}
                onClick={prevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} strokeWidth={2} aria-hidden />
              </Button>

              <div className="gsl-date-selector__calendar-header-center">
                <Dropdown
                  value={String(leftMonth)}
                  onValueChange={(v: string | null) => {
                    if (v !== null) setLeftMonth(Number(v));
                  }}
                  options={monthOptions}
                  aria-label="Select month"
                />
                <Dropdown
                  value={String(viewYear)}
                  onValueChange={(v: string | null) => {
                    if (v !== null) setViewYear(Number(v));
                  }}
                  options={yearDropdownOptions}
                  aria-label="Select year"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={cn(classNames?.calendarNav)}
                onClick={nextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={16} strokeWidth={2} aria-hidden />
              </Button>
            </div>

            <div className="gsl-date-selector__calendar-months">
              <MonthPanel
                year={viewYear}
                month={leftMonth}
                pendingRange={pendingRange}
                today={today}
                min={min}
                max={max}
                disabled={disabled}
                classNames={classNames}
                onSelect={handleSelect}
              />
              <MonthPanel
                year={rightYear}
                month={rightMonth}
                pendingRange={pendingRange}
                today={today}
                min={min}
                max={max}
                disabled={disabled}
                classNames={classNames}
                onSelect={handleSelect}
              />
            </div>

            <div
              className={cn(
                "gsl-date-selector__calendar-footer",
                classNames?.calendarFooter,
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(classNames?.cancelButton)}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className={cn(classNames?.applyButton)}
                onClick={handleApply}
                disabled={!hasSelection}
              >
                Apply
              </Button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
});
