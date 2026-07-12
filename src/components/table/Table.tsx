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
  MoreHorizontal,
  Inbox,
  TableIcon,
} from "lucide-react";
import { Checkbox } from "../checkbox/Checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
} from "../popover/Popover";
import type {
  TableColumn,
  TableContentProps,
  TableFooterProps,
} from "../../types/table";
import type { TableProps, SortDirection } from "../../types/table";
import { cn } from "../../utils/cn";
import "./styles/table.css";
import { TableContext } from "./TableContext";

const DEFAULT_TABLE_EMPTY_ICON = <TableIcon size={40} strokeWidth={1} />;

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
    variant = "default",
    columns: rawColumns,
    data: rawData,
    rowKey,
    loading = false,
    loadingRows = 5,
    selectable = false,
    selectedIds = new Set(),
    onSelectionChange,
    rowActions,
    virtualRowHeight,
    emptyIcon,
    emptyText,
    classNames,

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

  const [openPopoverKey, setOpenPopoverKey] = useState<string | number | null>(
    null,
  );

  const columns = useMemo(() => rawColumns ?? [], [rawColumns]);
  const data = useMemo(() => rawData ?? [], [rawData]);

  const dataWithIndex = useMemo(
    () => data.map((row, i) => ({ row, index: i })),
    [data],
  );

  const hasData = columns.length > 0 && data.length > 0;

  // Selection state (reads from controlled selectedIds prop)
  const allSelected =
    selectable && data.length > 0
      ? dataWithIndex.every(({ row, index }) =>
          selectedIds.has(resolveKey(row, index)),
        )
      : false;

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange || !dataWithIndex.length) return;
      const next = new Set(selectedIds);
      dataWithIndex.forEach(({ row, index }) => {
        const key = resolveKey(row, index);
        if (checked) next.add(key);
        else next.delete(key);
      });
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange, dataWithIndex, resolveKey],
  );

  const handleToggleRow = useCallback(
    (key: string | number) => {
      if (!onSelectionChange) return;
      const next = new Set(selectedIds);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange],
  );

  const hasRowActions = rowActions && rowActions.length > 0;
  // The kebab actions column only exists to hold rowActions (plus a
  // Select/Deselect toggle when selectable). With no rowActions, selection
  // is already handled by the checkbox column, so there's nothing for it
  // to show — don't render an empty kebab column in that case.
  const hasActionsColumn = hasRowActions;

  // Extra colSpan when selectable or actions column adds a column
  const colSpan =
    columns.length + (selectable ? 1 : 0) + (hasActionsColumn ? 1 : 0);

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
    const isSelected = selectable && selectedIds.has(key);
    const actions = hasRowActions
      ? rowActions!.filter((a) => !a.condition || a.condition(row))
      : null;
    const hasCustomActions = actions && actions.length > 0;

    const handleActionClick = (
      e: React.MouseEvent<HTMLButtonElement>,
      cb: () => void,
    ) => {
      e.preventDefault();
      e.stopPropagation();
      cb();
      setOpenPopoverKey(null);
    };

    return (
      <tr
        key={key}
        onClick={() => selectable && handleToggleRow(key)}
        onContextMenu={(e) => {
          if (!hasActionsColumn) return;
          e.preventDefault();
          setOpenPopoverKey(key);
        }}
        className={cn(selectable && "gsl-table__row--clickable")}
      >
        <td
          className={cn("gsl-table__checkbox-cell", classNames?.checkboxCell)}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
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

        {hasActionsColumn && (
          <td
            className={cn("gsl-table__actions-cell", classNames?.actionsCell)}
            onClick={(e) => e.stopPropagation()}
          >
            <Popover
              open={openPopoverKey === key}
              onOpenChange={(open) => {
                setOpenPopoverKey(open ? key : null);
              }}
            >
              <PopoverTrigger
                className={cn(
                  "gsl-table__actions-trigger",
                  classNames?.actionsTrigger,
                )}
                aria-label="Row actions"
              >
                <MoreHorizontal size={14} strokeWidth={1.5} />
              </PopoverTrigger>
              <PopoverPortal>
                <PopoverContent
                  className={cn(
                    "gsl-table__actions-menu",
                    classNames?.actionsMenu,
                  )}
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  {selectable && (
                    <button
                      type="button"
                      className={cn(
                        "gsl-table__actions-item",
                        classNames?.actionsItem,
                      )}
                      onClick={(e) =>
                        handleActionClick(e, () => handleToggleRow(key))
                      }
                    >
                      {isSelected ? "Deselect" : "Select"}
                    </button>
                  )}
                  {selectable && hasCustomActions && (
                    <div className="gsl-table__actions-separator" />
                  )}
                  {actions?.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      className={cn(
                        "gsl-table__actions-item",
                        action.variant === "destructive" &&
                          "gsl-table__actions-item--destructive",
                        classNames?.actionsItem,
                      )}
                      onClick={(e) =>
                        handleActionClick(e, () => action.onClick(row))
                      }
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </PopoverContent>
              </PopoverPortal>
            </Popover>
          </td>
        )}
      </tr>
    );
  }

  const headerRow = (
    <tr>
      <th className={cn("gsl-table__checkbox-cell", classNames?.checkboxCell)}>
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
              classNames?.th,
            )}
            onClick={() => {
              if (!col.sortable) return;
              const next: SortDirection =
                isSorted && dir === "asc" ? "desc" : "asc";
              setSort({ column: col.id, direction: next });
            }}
          >
            <span className={cn("gsl-table__th-label", classNames?.thLabel)}>
              {col.header}
            </span>
            {col.sortable && (
              <span
                className={cn("gsl-table__sort-icon", classNames?.sortIcon)}
              >
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
      {hasActionsColumn && (
        <th
          className={cn("gsl-table__actions-cell", classNames?.actionsCell)}
        />
      )}
    </tr>
  );

  return (
    <div
      ref={ref}
      className={cn(
        "gsl-table__content",
        variant === "panel" && "gsl-table__content--panel",
        selectable &&
          selectedIds.size > 0 &&
          "gsl-table__content--has-selected",
        classNames?.root,
        className,
      )}
      {...rest}
    >
      {loading ? (
        <table>
          <thead>
            <tr>
              {selectable && (
                <th
                  className={cn(
                    "gsl-table__checkbox-cell",
                    classNames?.checkboxCell,
                  )}
                >
                  <span
                    className={cn(
                      "gsl-table__skeleton gsl-table__skeleton--cb",
                      classNames?.skeleton,
                    )}
                  />
                </th>
              )}
              {columns.length > 0
                ? columns.map((col) => (
                    <th key={col.id} style={colStyle(col)}>
                      <span
                        className={cn(
                          "gsl-table__th-label",
                          classNames?.thLabel,
                        )}
                      >
                        {col.header}
                      </span>
                    </th>
                  ))
                : Array.from({ length: loadingRows }, (_, i) => (
                    <th key={i}>
                      <span
                        className={cn(
                          "gsl-table__skeleton gsl-table__skeleton--th",
                          classNames?.skeleton,
                        )}
                      />
                    </th>
                  ))}
              {hasActionsColumn && (
                <th
                  className={cn(
                    "gsl-table__actions-cell",
                    classNames?.actionsCell,
                  )}
                />
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: loadingRows }, (_, rowIdx) => (
              <tr key={rowIdx}>
                {selectable && (
                  <td
                    className={cn(
                      "gsl-table__checkbox-cell",
                      classNames?.checkboxCell,
                    )}
                  >
                    <span
                      className={cn(
                        "gsl-table__skeleton gsl-table__skeleton--cb",
                        classNames?.skeleton,
                      )}
                    />
                  </td>
                )}
                {columns.length > 0
                  ? columns.map((col) => (
                      <td key={col.id} style={colStyle(col)}>
                        <span
                          className={cn(
                            "gsl-table__skeleton gsl-table__skeleton--td",
                            classNames?.skeleton,
                          )}
                        />
                      </td>
                    ))
                  : Array.from({ length: loadingRows }, (_, cellIdx) => (
                      <td key={cellIdx}>
                        <span
                          className={cn(
                            "gsl-table__skeleton gsl-table__skeleton--td",
                            classNames?.skeleton,
                          )}
                        />
                      </td>
                    ))}
                {hasActionsColumn && (
                  <td
                    className={cn(
                      "gsl-table__actions-cell",
                      classNames?.actionsCell,
                    )}
                  />
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : hasData ? (
        isVirtual ? (
          <div
            ref={scrollRef}
            className={cn("gsl-table__viewport", classNames?.viewport)}
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
            <tbody>{sorted.map((row, i) => renderRow(row, i))}</tbody>
          </table>
        )
      ) : children ? (
        children
      ) : (
        <table>
          <thead>{headerRow}</thead>
          <tbody>
            <tr>
              <td colSpan={colSpan || 1}>
                <div className={cn("gsl-table__empty", classNames?.empty)}>
                  <div
                    className={cn("gsl-table__empty-icon", classNames?.emptyIcon)}
                  >
                    {emptyIcon ?? DEFAULT_TABLE_EMPTY_ICON}
                  </div>
                  <div
                    className={cn("gsl-table__empty-text", classNames?.emptyText)}
                  >
                    {emptyText ?? "No results"}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export const TableContent = forwardRef(TableContentRender) as <T>(
  props: TableContentProps<T> & { ref?: Ref<HTMLDivElement> },
) => React.ReactElement;

/* ── Footer ── */

export const TableFooter = forwardRef<HTMLDivElement, TableFooterProps>(
  function TableFooter({ classNames, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-table__footer", classNames?.root, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
