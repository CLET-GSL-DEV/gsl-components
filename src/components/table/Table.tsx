import {
  forwardRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type Ref,
  type ForwardedRef,
} from "react";
import {
  ArrowUpDownIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { TableColumn } from "../../types/table";
import type {
  TableProps,
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

/* ── Footer ── */

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
