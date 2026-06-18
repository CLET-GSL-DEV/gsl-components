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
  return d >= s && d <= e;
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
    placeholder,
    invalid = false,
    disabled = false,
    min,
    max,
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

  const [openField, setOpenField] = useState<"start" | "end" | null>(null);

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
        ? date.toLocaleDateString("en-US", DEFAULT_FORMAT)
        : "",
    [],
  );

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

      if (openField === "start") {
        const newEnd =
          range.end && normalized > range.end ? normalized : range.end;
        setRange({ start: normalized, end: newEnd });
        setOpenField(newEnd && normalized > newEnd ? null : "end");
      } else if (openField === "end") {
        if (range.start && normalized < range.start) {
          setRange({ start: normalized, end: range.start });
        } else {
          setRange({ start: range.start, end: normalized });
        }
        setOpenField(null);
      }
    },
    [disabled, min, max, openField, range, setRange],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (!next) setOpenField(null);
    },
    [disabled],
  );

  const openFieldPicker = useCallback(
    (field: "start" | "end") => {
      if (disabled) return;
      const refDate = field === "start" ? range.start : range.end;
      if (refDate) {
        setViewYear(refDate.getFullYear());
        setViewMonth(refDate.getMonth());
      }
      setOpenField(openField === field ? null : field);
    },
    [disabled, openField, range],
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
      <Popover.Root
        open={openField !== null}
        onOpenChange={handleOpenChange}
      >
        <div className="gsl-date-range-selector__fields">
          <div
            className={cn(
              "gsl-date-range-selector__field",
              classNames?.field,
            )}
          >
            <span
              className={cn(
                "gsl-date-range-selector__field-label",
                classNames?.fieldLabel,
              )}
            >
              From
            </span>
            <Popover.Trigger asChild>
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  "gsl-date-selector__trigger",
                  !range.start && "gsl-date-selector__trigger--placeholder",
                  classNames?.trigger,
                )}
                aria-invalid={invalid || undefined}
                onClick={(e) => {
                  e.preventDefault();
                  openFieldPicker("start");
                }}
              >
                <Calendar
                  size={16}
                  strokeWidth={1.75}
                  className="gsl-date-selector__trigger-icon"
                  aria-hidden
                />
                <span className="gsl-date-selector__trigger-text">
                  {range.start
                    ? formatDate(range.start)
                    : placeholder?.start ?? "Start date"}
                </span>
              </button>
            </Popover.Trigger>
          </div>

          <div
            className={cn(
              "gsl-date-range-selector__field",
              classNames?.field,
            )}
          >
            <span
              className={cn(
                "gsl-date-range-selector__field-label",
                classNames?.fieldLabel,
              )}
            >
              To
            </span>
            <Popover.Trigger asChild>
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  "gsl-date-selector__trigger",
                  !range.end && "gsl-date-selector__trigger--placeholder",
                  classNames?.trigger,
                )}
                aria-invalid={invalid || undefined}
                onClick={(e) => {
                  e.preventDefault();
                  openFieldPicker("end");
                }}
              >
                <Calendar
                  size={16}
                  strokeWidth={1.75}
                  className="gsl-date-selector__trigger-icon"
                  aria-hidden
                />
                <span className="gsl-date-selector__trigger-text">
                  {range.end
                    ? formatDate(range.end)
                    : placeholder?.end ?? "End date"}
                </span>
              </button>
            </Popover.Trigger>
          </div>
        </div>

        <Popover.Portal>
          <Popover.Content
            className={cn(
              "gsl-date-selector__calendar",
              classNames?.calendar,
            )}
            side="bottom"
            align="start"
            sideOffset={4}
            aria-label="Date picker"
          >
            <div className="gsl-date-selector__calendar-header">
              <button
                type="button"
                className="gsl-date-selector__calendar-nav"
                onClick={prevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} strokeWidth={2} aria-hidden />
              </button>
              <span className="gsl-date-selector__calendar-title">
                {monthLabel}
              </span>
              <button
                type="button"
                className="gsl-date-selector__calendar-nav"
                onClick={nextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>

            <div className="gsl-date-selector__calendar-weekdays" role="row">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="gsl-date-selector__calendar-weekday"
                  role="columnheader"
                  aria-label={day}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="gsl-date-selector__calendar-grid" role="grid">
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
                    className={cn(
                      "gsl-date-selector__calendar-day",
                      isCurrentMonth && "gsl-date-selector__calendar-day--current",
                      isToday && "gsl-date-selector__calendar-day--today",
                      isStart && "gsl-date-selector__calendar-day--selected",
                      isEnd && "gsl-date-selector__calendar-day--selected",
                      inRange &&
                        !isStart &&
                        !isEnd &&
                        "gsl-date-selector__calendar-day--in-range",
                      (isDisabled || !isCurrentMonth) &&
                        "gsl-date-selector__calendar-day--disabled",
                    )}
                    onClick={() => handleSelect(day)}
                    tabIndex={isCurrentMonth && day.getDate() === 1 ? 0 : -1}
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
