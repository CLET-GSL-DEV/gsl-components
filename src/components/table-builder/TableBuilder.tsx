import { forwardRef, useState, useEffect, useCallback, type ReactNode, type ChangeEvent } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import type {
  TableBuilderProps,
  TableBuilderSearchProps,
  TableBuilderFilterProps,
  PaginationControlsProps,
} from "../../types/table-builder";
import { cn } from "../../utils/cn";
import "./styles/table-builder.css";

/* ── Root ── */

const TableBuilderRoot = forwardRef<HTMLDivElement, TableBuilderProps>(
  function TableBuilderRoot(
    { className, classNames, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn("gsl-table-builder", classNames?.root, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

/* ── Header ── */

const TableBuilderHeader = forwardRef<
  HTMLDivElement,
  { className?: string; children?: ReactNode }
>(function TableBuilderHeader({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("gsl-table-builder__header", className)}
      {...props}
    >
      {children}
    </div>
  );
});

/* ── Search ── */

const TableBuilderSearch = forwardRef<
  HTMLInputElement,
  TableBuilderSearchProps
>(function TableBuilderSearch(
  { placeholder = "Search...", debounceMs = 300, onSearch, onChange, value: _value, className, ...props },
  ref,
) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch?.(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      onChange?.(e);
    },
    [onChange],
  );

  return (
    <div className={cn("gsl-table-builder__search", className)}>
      <Search
        size={14}
        strokeWidth={1.5}
        className="gsl-table-builder__search-icon"
        aria-hidden
      />
      <input
        ref={ref}
        type="text"
        className="gsl-table-builder__search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
});

/* ── Filter ── */

const TableBuilderFilter = forwardRef<
  HTMLDivElement,
  TableBuilderFilterProps
>(function TableBuilderFilter(
  {
    children,
    onApply,
    onReset,
    applyLabel = "Apply Filter",
    resetLabel = "Reset",
    className,
  },
  ref,
) {
  const [open, setOpen] = useState(false);

  return (
    <div ref={ref} className={cn("gsl-table-builder__filter", className)}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="gsl-table-builder__filter-trigger"
            aria-label="Filter"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden />
            Filter
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="gsl-table-builder__filter-content"
            side="bottom"
            align="end"
            sideOffset={6}
          >
            {children && (
              <div className="gsl-table-builder__filter-fields">
                {children}
              </div>
            )}

            <div className="gsl-table-builder__filter-actions">
              <button
                type="button"
                className="gsl-table-builder__filter-btn gsl-table-builder__filter-btn--reset"
                onClick={() => {
                  onReset?.();
                  setOpen(false);
                }}
              >
                {resetLabel}
              </button>
              <button
                type="button"
                className="gsl-table-builder__filter-btn gsl-table-builder__filter-btn--apply"
                onClick={() => {
                  onApply?.();
                  setOpen(false);
                }}
              >
                {applyLabel}
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
});

/* ── Content (table wrapper) ── */

const TableBuilderContent = forwardRef<
  HTMLDivElement,
  { className?: string; children?: ReactNode }
>(function TableBuilderContent({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("gsl-table-builder__content", className)}
      {...props}
    >
      {children}
    </div>
  );
});

/* ── Footer ── */

const TableBuilderFooter = forwardRef<
  HTMLDivElement,
  { className?: string; children?: ReactNode }
>(function TableBuilderFooter({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("gsl-table-builder__footer", className)}
      {...props}
    >
      {children}
    </div>
  );
});

/* ── Pagination ── */

const TableBuilderPagination = forwardRef<
  HTMLDivElement,
  PaginationControlsProps
>(function TableBuilderPagination(
  { page, totalPages, onPageChange, className },
  ref,
) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      ref={ref}
      className={cn("gsl-table-builder__pagination", className)}
    >
      <button
        type="button"
        className="gsl-table-builder__page-btn"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={14} strokeWidth={1.5} aria-hidden />
        Previous
      </button>

      <span className="gsl-table-builder__page-info">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        className="gsl-table-builder__page-btn"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next
        <ChevronRight size={14} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
});

/* ── Attach compound ── */

export const TableBuilder = Object.assign(TableBuilderRoot, {
  Header: TableBuilderHeader,
  Search: TableBuilderSearch,
  Filter: TableBuilderFilter,
  Content: TableBuilderContent,
  Footer: TableBuilderFooter,
  Pagination: TableBuilderPagination,
});
