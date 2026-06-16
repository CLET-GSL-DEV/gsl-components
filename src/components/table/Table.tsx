import {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type ChangeEvent,
  type CSSProperties,
  type Ref,
  type ForwardedRef,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  ArrowUpDownIcon,
  ArrowUp,
  ArrowDown,
  X,
  XCircle,
} from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import type { TableColumn } from "../../types/table";
import type {
  TableProps,
  TableSearchProps,
  TableFilterProps,
  PaginationControlsProps,
  TableSortState,
  SortDirection,
} from "../../types/table";
import { cn } from "../../utils/cn";
import "./styles/table.css";

/* ── Helpers ── */

function getCellValue<T>(row: T, col: TableColumn<T>): ReactNode {
  if (col.accessorFn) return col.accessorFn(row);
  if (col.accessorKey != null) return row[col.accessorKey] as ReactNode;
  return null;
}

function colStyle(col: {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}): CSSProperties {
  const style: CSSProperties = {};
  if (col.width) {
    style.width = col.width;
  } else {
    style.minWidth = col.minWidth ?? 120;
  }
  if (col.maxWidth) style.maxWidth = col.maxWidth;
  return style;
}

/* ── Root ── */

export const Table = forwardRef<HTMLDivElement, TableProps>(function Table(
  { className, classNames, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("gsl-table", classNames?.root, className)}
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
      value: _value,
      className,
      ...props
    },
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

    const clear = useCallback(() => {
      setValue("");
      onChange?.({
        target: { value: "" },
      } as ChangeEvent<HTMLInputElement>);
    }, [onChange]);

    return (
      <div className={cn("gsl-table__search", className)}>
        <Search
          size={14}
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
          <button
            type="button"
            className="gsl-table__search-clear"
            onClick={clear}
            aria-label="Clear search"
          >
            <X size={14} strokeWidth={1.5} aria-hidden />
          </button>
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
      activeCount,
      applyLabel = "Apply Filter",
      resetLabel = "Reset",
      className,
    },
    ref,
  ) {
    const [open, setOpen] = useState(false);

    return (
      <div ref={ref} className={cn("gsl-table__filter", className)}>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="gsl-table__filter-trigger"
              aria-label="Filter"
            >
              <FilterIcon size={14} strokeWidth={1.5} aria-hidden />
              Filter
              {activeCount != null && activeCount > 0 && (
                <span className="gsl-table__filter-badge">{activeCount}</span>
              )}
            </button>
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
                  onClick={() => {
                    onReset?.();
                    setOpen(false);
                  }}
                >
                  clear
                  <XCircle size={14} strokeWidth={1.5} />
                </button>
              </div>

              {children && (
                <div className="gsl-table__filter-fields">{children}</div>
              )}

              <div className="gsl-table__filter-actions">
                <button
                  type="button"
                  className="gsl-table__filter-btn gsl-table__filter-btn--apply"
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
  },
);

/* ── Content ── */

interface TableContentInnerProps<T = unknown> {
  className?: string;
  children?: ReactNode;
  columns?: TableColumn<T>[];
  data?: T[];
  rowKey?: (row: T) => string | number;
}

function TableContentRender<T>(
  props: TableContentInnerProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    className,
    children,
    columns: rawColumns,
    data: rawData,
    rowKey,
    ...rest
  } = props;
  const [sort, setSort] = useState<{
    column: string;
    direction: SortDirection;
  } | null>(null);

  const columns = rawColumns ?? [];
  const data = rawData ?? [];
  const hasData = columns.length > 0 && data.length > 0;

  const sorted = [...data].sort((a, b) => {
    if (!sort) return 0;
    const col = columns.find((c) => c.id === sort.column);
    if (!col) return 0;
    const aVal = String(getCellValue(a, col) ?? "");
    const bVal = String(getCellValue(b, col) ?? "");
    const cmp = aVal.localeCompare(bVal);
    return sort.direction === "asc" ? cmp : -cmp;
  });

  return (
    <div ref={ref} className={cn("gsl-table__content", className)} {...rest}>
      {hasData ? (
        <table>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.column === col.id;
                const dir = isSorted ? sort!.direction : null;

                return (
                  <th
                    key={col.id}
                    style={colStyle(col)}
                    className={cn(
                      col.sortable && "gsl-table__th--sortable",
                      isSorted && "gsl-table__th--sorted",
                    )}
                    onClick={() => {
                      if (!col.sortable) return;
                      const next: SortDirection =
                        isSorted && dir === "asc" ? "desc" : "asc";
                      setSort({ column: col.id, direction: next });
                    }}
                  >
                    <span className="gsl-table__th-label">{col.header}</span>
                    {col.sortable && (
                      <span className="gsl-table__sort-icon">
                        {isSorted ? (
                          dir === "asc" ? (
                            <ArrowUp size={14} strokeWidth={2} aria-hidden />
                          ) : (
                            <ArrowDown size={14} strokeWidth={2} aria-hidden />
                          )
                        ) : (
                          <ArrowUpDownIcon
                            size={14}
                            strokeWidth={1.5}
                            aria-hidden
                          />
                        )}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="gsl-table__empty">
                  No data
                </td>
              </tr>
            ) : (
              sorted.map((row) => {
                const key = rowKey!(row);
                return (
                  <tr key={key}>
                    {columns.map((col) => {
                      const rawValue = getCellValue(row, col);
                      const cellContent = col.cell
                        ? col.cell({ row, value: rawValue })
                        : rawValue;

                      return (
                        <td key={col.id} style={colStyle(col)}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      ) : (
        children
      )}
    </div>
  );
}

export const TableContent = forwardRef(TableContentRender) as <T>(
  props: TableContentInnerProps<T> & { ref?: Ref<HTMLDivElement> },
) => React.ReactElement;

export const TableFooter = forwardRef<
  HTMLDivElement,
  { className?: string; children?: ReactNode }
>(function TableFooter({ className, children, ...props }, ref) {
  return (
    <div ref={ref} className={cn("gsl-table__footer", className)} {...props}>
      {children}
    </div>
  );
});

export const TablePagination = forwardRef<
  HTMLDivElement,
  PaginationControlsProps
>(function TablePagination(
  { page, totalPages, onPageChange, totalItems, pageSize = 10, className },
  ref,
) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const start = totalItems ? (page - 1) * pageSize + 1 : null;
  const end = totalItems ? Math.min(page * pageSize, totalItems) : null;

  return (
    <div ref={ref} className={cn("gsl-table__pagination", className)}>
      {totalItems != null && (
        <span className="gsl-table__page-results">
          Showing {start}&ndash;{end} of {totalItems}
        </span>
      )}
      <button
        type="button"
        className="gsl-table__page-btn"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={14} strokeWidth={1.5} aria-hidden />
        Previous
      </button>

      <span className="gsl-table__page-info">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        className="gsl-table__page-btn"
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
