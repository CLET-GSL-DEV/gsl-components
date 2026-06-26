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
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowUpDownIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Checkbox } from "../checkbox/Checkbox";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "../popover/Popover";
import type { TableColumn } from "../../types/table";
import type {
  TableProps,
  SortDirection,
} from "../../types/table";
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
  { className, classNames, paramPrefix, children, ...props },
  ref,
) {
  return (
    <TableContext.Provider value={{ paramPrefix }}>
      <div
        ref={ref}
        className={cn("gsl-table", classNames?.root, className)}
        {...props}
      >
        {children}
      </div>
    </TableContext.Provider>
  );
});

/* ── Content ── */

interface TableContentInnerProps<T = unknown> {
  className?: string;
  children?: ReactNode;
  columns?: TableColumn<T>[];
  data?: T[];
  rowKey?: (row: T) => string | number;
  loading?: boolean;
  loadingRows?: number;
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  rowActions?: import("../../types/table").TableRowAction[];
  bulkActions?: import("../../types/table").TableBulkAction[];
  onRowClick?: (rowKey: string | number) => void;
  onRowContextMenu?: (rowKey: string | number, event: React.MouseEvent) => void;
  virtualize?: boolean;
  virtualRowHeight?: number;
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
    loading = false,
    loadingRows = 5,
    selectable = false,
    selectedIds,
    onSelectionChange,
    rowActions,
    bulkActions,
    onRowClick,
    onRowContextMenu,
    virtualize = false,
    virtualRowHeight = 44,
    ...rest
  } = props;
  const [sort, setSort] = useState<{
    column: string;
    direction: SortDirection;
  } | null>(null);

  const columns = useMemo(() => rawColumns ?? [], [rawColumns]);
  const data = useMemo(() => rawData ?? [], [rawData]);
  const hasData = columns.length > 0 && data.length > 0;

  const hasSelection = selectedIds !== undefined && selectedIds.size > 0;
  const showCheckboxColumn = selectable && hasSelection;

  // ── Context menu state ──

  const [contextRowKey, setContextRowKey] = useState<string | number | null>(null);
  const [contextOpen, setContextOpen] = useState(false);

  // ── Selection ──

  const allSelected =
    selectable && data.length > 0
      ? data.every((row) => selectedIds?.has(rowKey!(row)))
      : false;
  const someSelected =
    selectable && data.length > 0
      ? data.some((row) => selectedIds?.has(rowKey!(row)))
      : false;
  const indeterminate = someSelected && !allSelected;

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange || !data.length) return;
      const next = new Set(selectedIds ?? []);
      if (checked) {
        data.forEach((row) => next.add(rowKey!(row)));
      } else {
        data.forEach((row) => next.delete(rowKey!(row)));
      }
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange, data, rowKey],
  );

  const handleToggleRow = useCallback(
    (key: string | number) => {
      if (!onSelectionChange) return;
      const next = new Set(selectedIds ?? []);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange],
  );

  const colSpan = columns.length + (showCheckboxColumn ? 1 : 0);

  // ── Sort ──

  const sorted = [...data].sort((a, b) => {
    if (!sort) return 0;
    const col = columns.find((c) => c.id === sort.column);
    if (!col) return 0;
    const aVal = String(getCellValue(a, col) ?? "");
    const bVal = String(getCellValue(b, col) ?? "");
    const cmp = aVal.localeCompare(bVal);
    return sort.direction === "asc" ? cmp : -cmp;
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: virtualize ? sorted.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => virtualRowHeight,
    overscan: 5,
  });
  const virtualRows = virtualizer.getVirtualItems();

  // ── Row rendering ──

  const multiSelected = selectable && selectedIds && selectedIds.size > 1;

  function renderRow(row: T) {
    const key = rowKey!(row);
    const isSelected = selectedIds?.has(key) ?? false;

    return (
      <Popover
        open={contextOpen && contextRowKey === key}
        onOpenChange={(open) => { if (!open) setContextOpen(false); }}
      >
        <PopoverAnchor asChild>
          <tr
            key={key}
            className={cn(
              isSelected && "gsl-table__row--selected",
              contextOpen && contextRowKey === key && "gsl-table__row--context-open",
            )}
            onClick={() => {
              if (selectable) {
                handleToggleRow(key);
              } else {
                onRowClick?.(key);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onRowContextMenu) {
                onRowContextMenu(key, e);
              } else {
                setContextRowKey(key);
                setContextOpen(true);
              }
            }}
          >
            {showCheckboxColumn && (
              <td className="gsl-table__checkbox-cell">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggleRow(key)}
                  aria-label="Select row"
                />
              </td>
            )}
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
        </PopoverAnchor>
        {showContextMenu() && contextRowKey === key && (
          <PopoverContent
            align="end"
            sideOffset={4}
            className="gsl-popover--menu w-40"
            onInteractOutside={() => setContextOpen(false)}
          >
            <div className="gsl-popover__menu">
              {/* Select/Deselect for this row — always first when selectable */}
              {selectable && (
                <button
                  type="button"
                  className="gsl-popover__menu-item"
                  onClick={() => {
                    handleToggleRow(key);
                    setContextOpen(false);
                  }}
                >
                  {isSelected ? "Deselect" : "Select"}
                </button>
              )}
              {/* Bulk actions when multiple rows selected */}
              {bulkActions && bulkActions.length > 0 && selectedIds && selectedIds.size > 1 && (
                <>
                  <div className="my-1 h-px bg-border" />
                  {bulkActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      className={cn(
                        "gsl-popover__menu-item",
                        action.destructive && "gsl-popover__menu-item--destructive",
                      )}
                      onClick={() => {
                        action.onClick(selectedIds);
                        setContextOpen(false);
                      }}
                    >
                      {action.icon && <span className="gsl-popover__menu-icon">{action.icon}</span>}
                      {action.label}
                    </button>
                  ))}
                </>
              )}
              {/* Custom row actions */}
              {rowActions && rowActions.length > 0 && (
                <>
                  {(selectable || (bulkActions && selectedIds && selectedIds.size > 1)) && <div className="my-1 h-px bg-border" />}
                  {rowActions.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      className={cn(
                        "gsl-popover__menu-item",
                        action.destructive && "gsl-popover__menu-item--destructive",
                      )}
                      onClick={() => {
                        action.onClick(key);
                        setContextOpen(false);
                      }}
                    >
                      {action.icon && <span className="gsl-popover__menu-icon">{action.icon}</span>}
                      {action.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </PopoverContent>
        )}
      </Popover>
    );
  }

  function showContextMenu(): boolean {
    return (rowActions && rowActions.length > 0) || (bulkActions && bulkActions.length > 0) || selectable || !!onRowContextMenu;
  }

  // ── Header row ──

  const headerRow = (
    <tr>
      {showCheckboxColumn && (
        <th className="gsl-table__checkbox-cell">
          <span
            className={cn(
              indeterminate && "gsl-table__checkbox--indeterminate",
            )}
          >
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all rows"
            />
          </span>
        </th>
      )}
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
  );

  // ── Loading skeleton ──

  const loadingCheckboxVisible = selectable; // always show skeleton space when selectable

  // ── Applies className when row actions or right-click features are enabled ──

  const actionable = (rowActions && rowActions.length > 0) || (bulkActions && bulkActions.length > 0) || selectable || !!onRowContextMenu || !!onRowClick;

  return (
    <div
      ref={ref}
      className={cn(
        "gsl-table__content",
        showCheckboxColumn && "gsl-table__content--has-selected",
        contextOpen && "gsl-table__content--context-open",
        actionable && "gsl-table__content--row-actions",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <table>
          <thead>
            <tr>
              {loadingCheckboxVisible && (
                <th className="gsl-table__checkbox-cell">
                  <span className="gsl-table__skeleton gsl-table__skeleton--cb" />
                </th>
              )}
              {columns.length > 0
                ? columns.map((col) => (
                    <th key={col.id} style={colStyle(col)}>
                      <span className="gsl-table__th-label">
                        {col.header}
                      </span>
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
                {loadingCheckboxVisible && (
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
        virtualize ? (
          <div
            ref={scrollRef}
            className="gsl-table__viewport"
            style={{ overflow: "auto", flex: 1, minHeight: 0 }}
          >
            <table style={{ tableLayout: "fixed", width: "100%", borderCollapse: "collapse" }}>
              <thead>{headerRow}</thead>
              <tbody>
                <tr style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
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
                            <table style={{ tableLayout: "fixed", width: "100%", borderCollapse: "collapse" }}>
                              <tbody>
                                {renderRow(row)}
                              </tbody>
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
                sorted.map((row) => renderRow(row))
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
