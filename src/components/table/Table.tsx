import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type Ref,
  type ForwardedRef,
  useEffect,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDownIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Checkbox } from "../checkbox/Checkbox";
import type { TableColumn, TableContentProps } from "../../types/table";
import type { TableProps, SortDirection } from "../../types/table";
import { cn } from "../../utils/cn";
import "./styles/table.css";
import { TableContext } from "./TableContext";

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
  { className, classNames, paramPrefix, height, children, ...props },
  ref,
) {
  const style =
    height != null
      ? { height: typeof height === "number" ? `${height}px` : height }
      : undefined;
  return (
    <TableContext.Provider value={{ paramPrefix }}>
      <div
        ref={ref}
        className={cn("gsl-table", classNames?.root, className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    </TableContext.Provider>
  );
});

/* ── Content ── */

function TableContentRender<T>(
  props: TableContentProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {
    className,
    children,
    columns: rawColumns,
    data: rawData,
    rowKey,
    loading = false,
    loadingRows = 5,
    selectable = false,

    onSelectionChange,
    virtualRowHeight,
    defaultSelectedIds,

    ...rest
  } = props;

  const resolveKey = useCallback(
    (row: T, index: number): string | number => {
      if (rowKey) return rowKey(row);
      return index;
    },
    [rowKey],
  );

  const [sort, setSort] = useState<{
    column: string;
    direction: SortDirection;
  } | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    defaultSelectedIds ?? new Set(),
  );

  useEffect(() => {
    if (defaultSelectedIds) {
      setSelectedIds(defaultSelectedIds);
    }
  }, [defaultSelectedIds]);

  const columns = useMemo(() => rawColumns ?? [], [rawColumns]);
  const data = useMemo(() => rawData ?? [], [rawData]);

  const dataWithIndex = useMemo(
    () => data.map((row, i) => ({ row, index: i })),
    [data],
  );

  const hasData = columns.length > 0 && data.length > 0;

  // Selection state
  const allSelected =
    selectable && data.length > 0
      ? dataWithIndex.every(({ row, index }) =>
          selectedIds.has(resolveKey(row, index)),
        )
      : false;

  const someSelected =
    selectable && data.length > 0
      ? dataWithIndex.some(({ row, index }) =>
          selectedIds.has(resolveKey(row, index)),
        )
      : false;

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange || !data.length) return;
      const next = new Set(selectedIds);
      dataWithIndex.forEach(({ row, index }) => {
        const key = resolveKey(row, index);
        if (checked) {
          next.add(key);
        } else {
          next.delete(key);
        }
      });
      setSelectedIds(next);
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange, dataWithIndex, resolveKey],
  );

  const handleToggleRow = useCallback(
    (key: string | number) => {
      if (!onSelectionChange) return;
      const next = new Set(selectedIds);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      setSelectedIds(next);
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange],
  );

  // Extra colSpan when selectable adds a column
  const colSpan = columns.length + (selectable ? 1 : 0);

  const sorted = [...data].sort((a, b) => {
    if (!sort) return 0;
    const col = columns.find((c) => c.id === sort.column);
    if (!col) return 0;
    const aVal = String(getCellValue(a, col) ?? "");
    const bVal = String(getCellValue(b, col) ?? "");
    const cmp = aVal.localeCompare(bVal);
    return sort.direction === "asc" ? cmp : -cmp;
  });

  const isVirtual = virtualRowHeight != null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: isVirtual ? sorted.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => virtualRowHeight ?? 44,
    overscan: 5,
  });
  const virtualRows = virtualizer.getVirtualItems();

  function renderRow(row: T, rowIndex: number) {
    const key = resolveKey(row, rowIndex);
    return (
      <tr
        key={key}
        onClick={() => selectable && handleToggleRow(key)}
        className={cn(selectable && "gsl-table__row--clickable")}
      >
        <td
          className="gsl-table__checkbox-cell"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selectedIds.has(key)}
            onCheckedChange={() => handleToggleRow(key)}
            aria-label="Select row"
          />
        </td>

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
  }

  const headerRow = (
    <tr>
      <th className="gsl-table__checkbox-cell">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Select all rows"
        />
      </th>
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
                  <ArrowUpDownIcon size={14} strokeWidth={1.5} aria-hidden />
                )}
              </span>
            )}
          </th>
        );
      })}
    </tr>
  );

  return (
    <div
      ref={ref}
      className={cn(
        "gsl-table__content",
        selectable &&
          selectedIds.size > 0 &&
          "gsl-table__content--has-selected",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <table>
          <thead>
            <tr>
              {selectable && (
                <th className="gsl-table__checkbox-cell">
                  <span className="gsl-table__skeleton gsl-table__skeleton--cb" />
                </th>
              )}
              {columns.length > 0
                ? columns.map((col) => (
                    <th key={col.id} style={colStyle(col)}>
                      <span className="gsl-table__th-label">{col.header}</span>
                    </th>
                  ))
                : Array.from({ length: loadingRows }, (_, i) => (
                    <th key={i}>
                      <span className="gsl-table__skeleton gsl-table__skeleton--th" />
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: loadingRows }, (_, rowIdx) => (
              <tr key={rowIdx}>
                {selectable && (
                  <td className="gsl-table__checkbox-cell">
                    <span className="gsl-table__skeleton gsl-table__skeleton--cb" />
                  </td>
                )}
                {columns.length > 0
                  ? columns.map((col) => (
                      <td key={col.id} style={colStyle(col)}>
                        <span className="gsl-table__skeleton gsl-table__skeleton--td" />
                      </td>
                    ))
                  : Array.from({ length: loadingRows }, (_, cellIdx) => (
                      <td key={cellIdx}>
                        <span className="gsl-table__skeleton gsl-table__skeleton--td" />
                      </td>
                    ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : hasData ? (
        isVirtual ? (
          <div
            ref={scrollRef}
            className="gsl-table__viewport"
            style={{ overflow: "auto", flex: 1, minHeight: 0 }}
          >
            <table
              style={{
                tableLayout: "fixed",
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>{headerRow}</thead>
              <tbody>
                <tr
                  style={{
                    height: virtualizer.getTotalSize(),
                    position: "relative",
                  }}
                >
                  <td colSpan={colSpan} style={{ padding: 0 }}>
                    <div style={{ position: "relative", width: "100%" }}>
                      {virtualRows.map((vRow) => {
                        const row = sorted[vRow.index];
                        return (
                          <div
                            key={vRow.key}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              transform: `translateY(${vRow.start}px)`,
                            }}
                          >
                            <table
                              style={{
                                tableLayout: "fixed",
                                width: "100%",
                                borderCollapse: "collapse",
                              }}
                            >
                              <tbody>{renderRow(row, vRow.index)}</tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <table>
            <thead>{headerRow}</thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="gsl-table__empty">
                    No data
                  </td>
                </tr>
              ) : (
                sorted.map((row, i) => renderRow(row, i))
              )}
            </tbody>
          </table>
        )
      ) : (
        children
      )}
    </div>
  );
}

export const TableContent = forwardRef(TableContentRender) as <T>(
  props: TableContentProps<T> & { ref?: Ref<HTMLDivElement> },
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
