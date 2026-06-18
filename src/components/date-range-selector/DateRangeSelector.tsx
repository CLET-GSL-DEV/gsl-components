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
import { cn } from "../../utils/cn";
import "./styles/date-range-selector.css";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

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

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const calendarDays = useMemo(
    () => computeCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthLabel = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [viewYear, viewMonth]);

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

  const handleSelect = useCallback(
    (day: Date) => {
      if (disabled) return;
      if (!isDateInRange(day, min, max)) return;
      const normalized = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
      );

      if (!range.start) {
        setRange({ start: normalized, end: null });
      } else if (!range.end) {
        if (normalized < range.start) {
          setRange({ start: normalized, end: range.start });
        } else {
          setRange({ start: range.start, end: normalized });
        }
        setOpen(false);
      } else {
        setRange({ start: normalized, end: null });
      }
    },
    [disabled, min, max, range, setRange],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (next) {
        const refDate = range.start ?? today;
        setViewYear(refDate.getFullYear());
        setViewMonth(refDate.getMonth());
      }
      setOpen(next);
    },
    [disabled, range.start, today],
  );

  const prevMonth = useCallback(() => {
    setViewMonth((m) => (m === 0 ? 11 : m - 1));
    if (viewMonth === 0) setViewYear((y) => y - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => (m === 11 ? 0 : m + 1));
    if (viewMonth === 11) setViewYear((y) => y + 1);
  }, [viewMonth]);

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
              <button
                type="button"
                className={cn(
                  "gsl-date-selector__calendar-nav",
                  classNames?.calendarNav,
                )}
                onClick={prevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} strokeWidth={2} aria-hidden />
              </button>
              <span
                className={cn(
                  "gsl-date-selector__calendar-title",
                  classNames?.calendarTitle,
                )}
              >
                {monthLabel}
              </span>
              <button
                type="button"
                className={cn(
                  "gsl-date-selector__calendar-nav",
                  classNames?.calendarNav,
                )}
                onClick={nextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={16} strokeWidth={2} aria-hidden />
              </button>
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
                const isCurrentMonth = day.getMonth() === viewMonth;
                const isToday = isSameDay(day, today);
                const isStart = range.start
                  ? isSameDay(day, range.start)
                  : false;
                const isEnd = range.end
                  ? isSameDay(day, range.end)
                  : false;
                const inRange = isInSelectedRange(
                  day,
                  range.start,
                  range.end,
                );
                const isDisabled = !isDateInRange(day, min, max);

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
                    onClick={() => handleSelect(day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
});
