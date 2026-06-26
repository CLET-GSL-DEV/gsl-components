import {
  forwardRef,
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
  type ChangeEvent,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import { useSearchParams } from "react-router-dom";
import { Search, FilterIcon, XCircle } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import type { TableSearchProps, TableFilterProps } from "../../types/table";
import { cn } from "../../utils/cn";
import "./styles/table.css";
import { useTableContext } from "./TableContext";
import { Button } from "../button";

/* ── Helpers ── */

const FILTER_PREFIX = "f_";

function paramKey(prefix: string | undefined, key: string): string {
  return prefix ? `${prefix}.${key}` : key;
}

/* ── Actions ── */

export const TableActions = forwardRef<
  HTMLDivElement,
  { className?: string; children?: ReactNode }
>(function TableActions({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("gsl-table__actions", className)}
      {...props}
    >
      {children}
    </div>
  );
});

/* ── Header ── */

export const TableHeader = forwardRef<
  HTMLDivElement,
  { className?: string; children?: ReactNode }
>(function TableHeader({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("gsl-table__header-bar", className)}
      {...props}
    >
      {children}
    </div>
  );
});

/* ── Search ── */

export const TableSearch = forwardRef<HTMLInputElement, TableSearchProps>(
  function TableSearch(
    {
      placeholder = "Search...",
      debounceMs = 300,
      onSearch,
      onChange,
      className,
      ...props
    },
    ref,
  ) {
    const { paramPrefix } = useTableContext();
    const searchKey = paramKey(paramPrefix, "search");
    const pageKey = paramKey(paramPrefix, "page");

    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch = searchParams.get(searchKey) ?? "";

    const [value, setValue] = useState(urlSearch);
    const debouncedValue = useDebounce(value, debounceMs);

    // Sync URL → input when URL changes externally (e.g. back/forward, external reset)
    useEffect(() => {
      setValue(urlSearch);
    }, [urlSearch]);

    // Write to URL on debounced change
    useEffect(() => {
      if (debouncedValue === urlSearch) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (debouncedValue) {
            next.set(searchKey, debouncedValue);
          } else {
            next.delete(searchKey);
          }
          next.set(pageKey, "1");
          return next;
        },
        { replace: true },
      );
      onSearch?.(debouncedValue);
    }, [
      debouncedValue,
      urlSearch,
      setSearchParams,
      searchKey,
      pageKey,
      onSearch,
    ]);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange?.(e);
      },
      [onChange],
    );

    const clear = useCallback(() => {
      setValue("");
      onChange?.({
        target: { value: "" },
      } as ChangeEvent<HTMLInputElement>);
    }, [onChange]);

    return (
      <div className={cn("gsl-table__search", className)}>
        <Search
          size={16}
          strokeWidth={1.5}
          className="gsl-table__search-icon"
          aria-hidden
        />
        <input
          ref={ref}
          type="text"
          className="gsl-table__search-input"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {value && (
          <div
            className="gsl-table__search-clear"
            onClick={clear}
            aria-label="Clear search"
          >
            <XCircle size={16} strokeWidth={1.5} aria-hidden />
          </div>
        )}
      </div>
    );
  },
);

/* ── Filter ── */

export const TableFilter = forwardRef<HTMLDivElement, TableFilterProps>(
  function TableFilter(
    {
      children,
      onApply,
      onReset,
      applyLabel = "Apply Filter",
      className,
    },
    ref,
  ) {
    const { paramPrefix } = useTableContext();
    const [open, setOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const filterPrefix = paramKey(paramPrefix, FILTER_PREFIX);

    const activeCount = useMemo(() => {
      let count = 0;
      for (const key of searchParams.keys()) {
        if (key.startsWith(filterPrefix)) count++;
      }
      return count || undefined;
    }, [searchParams, filterPrefix]);

    const handleApply = useCallback(() => {
      const form = formRef.current;
      if (form) {
        const data = new FormData(form);
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            // Remove existing filter params
            for (const key of [...next.keys()]) {
              if (key.startsWith(filterPrefix)) {
                next.delete(key);
              }
            }
            // Set new filter values
            for (const [key, value] of data.entries()) {
              if (value && typeof value === "string" && value !== "") {
                next.set(`${filterPrefix}${key}`, value);
              }
            }
            // Reset to first page
            next.set(paramKey(paramPrefix, "page"), "1");
            return next;
          },
          { replace: true },
        );
      }
      onApply?.();
      setOpen(false);
    }, [setSearchParams, filterPrefix, paramPrefix, onApply]);

    const handleReset = useCallback(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const key of [...next.keys()]) {
            if (key.startsWith(filterPrefix)) {
              next.delete(key);
            }
          }
          return next;
        },
        { replace: true },
      );
      // Reset form fields
      formRef.current?.reset();
      onReset?.();
      setOpen(false);
    }, [setSearchParams, filterPrefix, onReset]);

    return (
      <div ref={ref} className={cn("gsl-table__filter", className)}>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button className="gsl-table__filter-trigger" aria-label="Filter">
              <FilterIcon size={14} strokeWidth={1.5} aria-hidden />
              Filters
              {activeCount != null && activeCount > 0 && (
                <span className="gsl-table__filter-badge">{activeCount}</span>
              )}
            </Button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className="gsl-table__filter-content"
              side="bottom"
              align="end"
              sideOffset={6}
            >
              <div className="gsl-table__filter-header">
                <div>Filters</div>
                <button
                  type="button"
                  className="gsl-table__filter-btn--reset"
                  onClick={handleReset}
                >
                  clear
                  <XCircle size={14} strokeWidth={1.5} />
                </button>
              </div>

              {children && (
                <form ref={formRef} className="gsl-table__filter-fields">
                  {children}
                </form>
              )}

              <div className="gsl-table__filter-actions">
                <button
                  type="button"
                  className="gsl-table__filter-btn gsl-table__filter-btn--apply"
                  onClick={handleApply}
                >
                  {applyLabel}
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  },
);
