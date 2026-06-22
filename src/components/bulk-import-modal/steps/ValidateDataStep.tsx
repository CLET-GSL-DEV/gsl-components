import { useCallback, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Checkbox } from "../../checkbox/Checkbox";
import { Button } from "../../button/Button";
import type {
  BulkImportField,
  BulkImportValidationError,
} from "../../../types/bulk-import-modal";

// ── Types ──

interface ColumnDef {
  key: string;
  label: string;
}

interface VisibleRow {
  row: Record<string, string>;
  rowId: number;
}

interface ValidateDataStepProps {
  fields: BulkImportField[];
  mappedFieldKeys: string[];
  mappedRows: Record<string, string>[];
  errors: BulkImportValidationError[];
  selectedRowIds: number[];
  showOnlyErrors: boolean;
  discardedRows: number[];
  onToggleRowSelection: (rowId: number) => void;
  onSetVisibleRowsSelection: (rowIds: number[], selected: boolean) => void;
  onShowOnlyErrorsChange: (value: boolean) => void;
  onDiscardSelectedRows: () => void;
  onResetDiscardedRows: () => void;
  onUpdateRowValue: (rowId: number, fieldKey: string, value: string) => void;
}

// ── Helpers ──

function buildErrorMap(errors: BulkImportValidationError[]) {
  const map = new Map<string, string>();
  for (const issue of errors) {
    map.set(`${issue.row}:${issue.fieldKey}`, issue.message);
  }
  return map;
}

// ── Constants ──

const ROW_HEIGHT = 44;

// ── Component ──

export function ValidateDataStep({
  fields,
  mappedFieldKeys,
  mappedRows,
  errors,
  selectedRowIds,
  showOnlyErrors,
  discardedRows,
  onToggleRowSelection,
  onSetVisibleRowsSelection,
  onShowOnlyErrorsChange,
  onDiscardSelectedRows,
  onResetDiscardedRows,
  onUpdateRowValue,
}: ValidateDataStepProps) {
  const errorMap = useMemo(() => buildErrorMap(errors), [errors]);
  const activeErrors = useMemo(
    () => errors.filter((e) => !discardedRows.includes(e.row)),
    [errors, discardedRows],
  );
  const rowsWithErrors = useMemo(
    () => new Set(activeErrors.map((issue) => issue.row)),
    [activeErrors],
  );
  const visibleFields = useMemo(
    () => fields.filter((field) => mappedFieldKeys.includes(field.key)),
    [fields, mappedFieldKeys],
  );

  const columns: ColumnDef[] = useMemo(
    () =>
      visibleFields.map((f) => ({
        key: f.key,
        label: f.label.toUpperCase(),
      })),
    [visibleFields],
  );

  const visibleRows: VisibleRow[] = useMemo(
    () =>
      mappedRows
        .map((row, index) => ({ row, rowId: index + 1 }))
        .filter(({ rowId }) => !discardedRows.includes(rowId))
        .filter(({ rowId }) => !showOnlyErrors || rowsWithErrors.has(rowId)),
    [mappedRows, discardedRows, showOnlyErrors, rowsWithErrors],
  );

  const visibleRowIds = useMemo(
    () => visibleRows.map(({ rowId }) => rowId),
    [visibleRows],
  );

  const allSelected =
    visibleRows.length > 0 &&
    visibleRowIds.every((id) => selectedRowIds.includes(id));
  const someSelected = visibleRowIds.some((id) =>
    selectedRowIds.includes(id),
  );
  const indeterminate = someSelected && !allSelected;

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      onSetVisibleRowsSelection(visibleRowIds, checked);
    },
    [visibleRowIds, onSetVisibleRowsSelection],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: visibleRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });
  const virtualRows = virtualizer.getVirtualItems();
  const hasVirtualRows = virtualRows.length > 0;

  const items = hasVirtualRows
    ? virtualRows
    : visibleRows.map((_, i) => ({
        key: i,
        index: i,
        start: i * ROW_HEIGHT,
        size: ROW_HEIGHT,
      }));

  const totalHeight = hasVirtualRows
    ? virtualizer.getTotalSize()
    : visibleRows.length * ROW_HEIGHT;

  const colCount = columns.length + 1; // +1 for checkbox column

  // ── Render ──

  return (
    <div className="gsl-bulk-import__step gsl-bulk-import__step--validate">
      <div className="gsl-bulk-import__step-header">
        <h3 className="gsl-bulk-import__step-title">Validate data</h3>
        {discardedRows.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetDiscardedRows}
          >
            Reset discarded rows
          </Button>
        )}
      </div>

      <div className="gsl-bulk-import__validate-toolbar">
        <div className="gsl-bulk-import__validate-actions">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedRowIds.length === 0}
            onClick={onDiscardSelectedRows}
          >
            Discard selected rows
          </Button>
          <label className="gsl-bulk-import__switch">
            <input
              type="checkbox"
              role="switch"
              className="gsl-bulk-import__switch-input"
              checked={showOnlyErrors}
              onChange={(event) =>
                onShowOnlyErrorsChange(event.target.checked)
              }
            />
            <span className="gsl-bulk-import__switch-track" aria-hidden="true">
              <span className="gsl-bulk-import__switch-thumb" />
            </span>
            <span className="gsl-bulk-import__switch-label">
              Show only rows with errors{" "}
              {activeErrors.length > 0 && `(${activeErrors.length})`}
            </span>
          </label>
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <p className="gsl-bulk-import__validate-empty">
          {showOnlyErrors ? "No rows with errors." : "No rows to validate."}
        </p>
      ) : (
        <div className="gsl-bulk-import__table-wrap--validate">
          <div
            ref={scrollRef}
            style={{
              overflow: "auto",
              flex: 1,
              minHeight: 0,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: 44,
                      minWidth: 44,
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "var(--gsl-surface-subtle)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      height: 40,
                      textAlign: "center",
                      verticalAlign: "middle",
                      padding: "0 12px",
                      borderBottom: "1px solid var(--gsl-border)",
                    }}
                  >
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : indeterminate
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        background: "var(--gsl-surface-subtle)",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--gsl-text-secondary)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        height: 40,
                        textAlign: "left",
                        verticalAlign: "middle",
                        padding: "0 16px",
                        borderBottom: "1px solid var(--gsl-border)",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    height: totalHeight,
                    position: "relative",
                  }}
                >
                  <td
                    colSpan={colCount}
                    style={{ padding: 0, position: "relative" }}
                  >
                    {items.map((item) => {
                      const { row, rowId } = visibleRows[item.index];
                      const isSelected = selectedRowIds.includes(rowId);

                      return (
                        <div
                          key={item.key}
                          data-index={item.index}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${item.size}px`,
                            transform: `translateY(${item.start}px)`,
                          }}
                        >
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              tableLayout: "fixed",
                            }}
                          >
                            <tbody>
                              <tr
                                data-selected={isSelected || undefined}
                                style={{
                                  height: ROW_HEIGHT,
                                  background: isSelected
                                    ? "var(--gsl-bulk-import-primary-light)"
                                    : undefined,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background =
                                      "var(--gsl-hover)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = "";
                                  }
                                }}
                              >
                                <td
                                  style={{
                                    width: 44,
                                    minWidth: 44,
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                    padding: "10px 0",
                                    borderBottom: "1px solid var(--gsl-border)",
                                  }}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      onToggleRowSelection(rowId)
                                    }
                                    aria-label="Select row"
                                  />
                                </td>
                                {visibleFields.map((field) => {
                                  const value = row[field.key] ?? "";
                                  const errorMessage = errorMap.get(
                                    `${rowId}:${field.key}`,
                                  );
                                  const inputEl = (
                                    <input
                                      type="text"
                                      className={[
                                        "gsl-bulk-import__cell-input",
                                        errorMessage
                                          ? "gsl-bulk-import__cell-input--error"
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                      value={String(value)}
                                      aria-invalid={
                                        errorMessage ? true : undefined
                                      }
                                      aria-label={`${field.label}, row ${rowId}`}
                                      onChange={(event) =>
                                        onUpdateRowValue(
                                          rowId,
                                          field.key,
                                          event.target.value,
                                        )
                                      }
                                    />
                                  );

                                  return (
                                    <td
                                      key={field.key}
                                      className={
                                        errorMessage
                                          ? "gsl-bulk-import__cell--error"
                                          : undefined
                                      }
                                      style={{
                                        padding: 0,
                                        height: ROW_HEIGHT,
                                        position: "relative",
                                        borderBottom:
                                          "1px solid var(--gsl-border)",
                                        overflow: "visible",
                                      }}
                                    >
                                      {errorMessage ? (
                                        <>
                                          {inputEl}
                                          <span
                                            className="gsl-bulk-import__cell-error-tooltip"
                                            role="tooltip"
                                          >
                                            {errorMessage}
                                          </span>
                                        </>
                                      ) : (
                                        inputEl
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
