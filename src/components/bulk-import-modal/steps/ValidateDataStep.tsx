import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, MutableRefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Checkbox } from "../../checkbox/Checkbox";
import { Button } from "../../button/Button";
import type {
  BulkImportField,
  BulkImportResult,
  BulkImportValidationError,
} from "../../../types/bulk-import-modal";
import { validateMappedRows } from "../utils/validateMappedRows";

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
  mappedRows: Record<string, string>[];
  errors: BulkImportValidationError[];
  discardedRows: number[];
  dirtyCellsRef: MutableRefObject<Record<string, string>>;
  stepResultRef: MutableRefObject<() => BulkImportResult>;
  onDiscardSelectedRows: (ids: number[]) => void;
  onResetDiscardedRows: () => void;
  onCanConfirmChange: (canConfirm: boolean) => void;
}

interface CellInputProps {
  rowId: number;
  fieldKey: string;
  baseValue: string;
  errorMessage: string | undefined;
  ariaLabel: string;
  dirtyCellsRef: MutableRefObject<Record<string, string>>;
  onDirty: (cellKey: string, value: string) => void;
}

// ── Helpers ──

function buildErrorMap(errors: BulkImportValidationError[]) {
  const map = new Map<string, string>();
  for (const issue of errors) {
    map.set(`${issue.row}:${issue.fieldKey}`, issue.message);
  }
  return map;
}

function isDirtyCell(errorMap: Map<string, string>, rowId: number, fieldKey: string) {
  return errorMap.has(`${rowId}:${fieldKey}`);
}

function patchRows(
  baseRows: Record<string, string>[],
  dirtyCells: Record<string, string>,
): Record<string, string>[] {
  if (Object.keys(dirtyCells).length === 0) return baseRows;
  return baseRows.map((row, i) => {
    const rowId = i + 1;
    let patched = row;
    for (const [cellKey, value] of Object.entries(dirtyCells)) {
      const colonIdx = cellKey.indexOf(":");
      const dRowId = Number(cellKey.slice(0, colonIdx));
      if (dRowId !== rowId) continue;
      const fieldKey = cellKey.slice(colonIdx + 1);
      if (patched === row) patched = { ...row };
      patched[fieldKey] = value;
    }
    return patched;
  });
}

// ── CellInput ──

function CellInput({
  rowId,
  fieldKey,
  baseValue,
  errorMessage,
  ariaLabel,
  dirtyCellsRef,
  onDirty,
}: CellInputProps) {
  const [value, setValue] = useState(baseValue);
  const cellKey = `${rowId}:${fieldKey}`;

  useEffect(() => {
    return () => {
      delete dirtyCellsRef.current[cellKey];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setValue(next);
      dirtyCellsRef.current[cellKey] = next;
      onDirty(cellKey, next);
    },
    [cellKey, dirtyCellsRef, onDirty],
  );

  return (
    <span className="gsl-bulk-import__cell-inner">
      <input
        type="text"
        className={[
          "gsl-bulk-import__cell-input",
          errorMessage ? "gsl-bulk-import__cell-input--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        value={value}
        aria-invalid={errorMessage ? true : undefined}
        aria-label={ariaLabel}
        onChange={handleChange}
      />
      {errorMessage && (
        <span
          className="gsl-bulk-import__cell-error-tooltip"
          role="tooltip"
        >
          {errorMessage}
        </span>
      )}
    </span>
  );
}

// ── Constants ──

const ROW_HEIGHT = 44;

type SelectionState = "ALL" | Set<number>;

// ── Component ──

export function ValidateDataStep({
  fields,
  mappedRows,
  errors,
  discardedRows,
  dirtyCellsRef,
  stepResultRef,
  onDiscardSelectedRows,
  onResetDiscardedRows,
  onCanConfirmChange,
}: ValidateDataStepProps) {
  const [selection, setSelection] = useState<SelectionState>(new Set());
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);

  // ── Local dirty cell tracking (for re-rendering validation) ──

  const [dirtyCells, setDirtyCells] = useState<Record<string, string>>({});

  const handleDirty = useCallback((cellKey: string, value: string) => {
    setDirtyCells((prev) => ({ ...prev, [cellKey]: value }));
  }, []);

  // ── Patched rows for local validation ──

  const patchedRows = useMemo(
    () => patchRows(mappedRows, dirtyCells),
    [mappedRows, dirtyCells],
  );

  // ── Local validation on patched rows ──

  const localValidation = useMemo(() => {
    if (Object.keys(dirtyCells).length === 0) return [];
    return validateMappedRows(patchedRows, fields);
  }, [patchedRows, fields, dirtyCells]);

  const localErrorMap = useMemo(() => buildErrorMap(localValidation), [localValidation]);

  const localErrors = useMemo(
    () => localValidation.filter((e) => e.severity === "error"),
    [localValidation],
  );

  // ── Merged errors: flow errors for clean cells, local errors for dirty cells ──

  const flowErrorMap = useMemo(() => buildErrorMap(errors), [errors]);

  const mergedErrors = useMemo(() => {
    const merged = new Map<string, string>();
    for (const [key, msg] of flowErrorMap) {
      merged.set(key, msg);
    }
    for (const [key, msg] of localErrorMap) {
      merged.set(key, msg);
    }
    return merged;
  }, [flowErrorMap, localErrorMap]);

  const activeErrors = useMemo(
    () => {
      const all = [...errors, ...localValidation];
      return all.filter((e) => e.severity === "error" && !discardedRows.includes(e.row));
    },
    [errors, localValidation, discardedRows],
  );

  const rowsWithErrors = useMemo(
    () => new Set(activeErrors.map((issue) => issue.row)),
    [activeErrors],
  );

  // ── Visible columns ──

  const dataKeys = useMemo(() => {
    if (mappedRows.length === 0) return new Set<string>();
    return new Set(Object.keys(mappedRows[0]));
  }, [mappedRows]);

  const visibleFields = useMemo(
    () => fields.filter((f) => dataKeys.has(f.key) || f.required),
    [fields, dataKeys],
  );

  const columns: ColumnDef[] = useMemo(
    () =>
      visibleFields.map((f) => ({
        key: f.key,
        label: f.label.toUpperCase(),
      })),
    [visibleFields],
  );

  // ── Visible rows ──

  const visibleRows: VisibleRow[] = useMemo(
    () =>
      patchedRows
        .map((row, index) => ({ row, rowId: index + 1 }))
        .filter(({ rowId }) => !discardedRows.includes(rowId))
        .filter(({ rowId }) => !showOnlyErrors || rowsWithErrors.has(rowId)),
    [patchedRows, discardedRows, showOnlyErrors, rowsWithErrors],
  );

  const visibleRowIds = useMemo(
    () => visibleRows.map(({ rowId }) => rowId),
    [visibleRows],
  );

  // ── Selection ──

  const allSelected = useMemo(() => {
    if (selection === "ALL") return visibleRows.length > 0;
    if (visibleRows.length === 0) return false;
    return visibleRowIds.every((id) => selection.has(id));
  }, [selection, visibleRowIds, visibleRows.length]);

  const someSelected = selection === "ALL" || selection.size > 0;
  const indeterminate = someSelected && !allSelected;

  const visibleRowIdsRef = useRef(visibleRowIds);
  visibleRowIdsRef.current = visibleRowIds;

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelection(checked ? "ALL" : new Set());
    },
    [],
  );

  const handleToggleRow = useCallback((rowId: number) => {
    setSelection((prev) => {
      if (prev === "ALL") {
        return new Set(visibleRowIdsRef.current.filter((id) => id !== rowId));
      }
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      if (next.size >= visibleRowIdsRef.current.length) return "ALL";
      return next;
    });
  }, []);

  const handleDiscard = useCallback(() => {
    const ids =
      selection === "ALL"
        ? visibleRowIdsRef.current
        : Array.from(selection);
    if (ids.length === 0) return;
    onDiscardSelectedRows(ids);
    setSelection(new Set());
  }, [selection, onDiscardSelectedRows]);

  // ── Step result (used by BulkImportModal on Confirm) ──

  const activeErrorList = useMemo(
    () => {
      const all = [...errors, ...localValidation];
      return all.filter((e) => !discardedRows.includes(e.row));
    },
    [errors, localValidation, discardedRows],
  );

  useEffect(() => {
    stepResultRef.current = () => {
      const rows = patchedRows.filter(
        (_, index) => !discardedRows.includes(index + 1),
      );
      return {
        rows,
        errors: activeErrorList.filter((e) => e.severity === "error"),
        warnings: activeErrorList.filter((e) => e.severity === "warning"),
      };
    };
    onCanConfirmChange(
      activeErrorList.filter((e) => e.severity === "error").length === 0,
    );
  }, [stepResultRef, patchedRows, discardedRows, activeErrorList, onCanConfirmChange]);

  // ── Virtualizer ──

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: visibleRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 25,
  });
  const virtualRows = virtualizer.getVirtualItems();
  const hasVirtualRows = virtualRows.length > 0;
  const isSmallDataset = visibleRows.length <= 50;

  const items = hasVirtualRows
    ? virtualRows
    : isSmallDataset
      ? visibleRows.map((_, i) => ({
          key: i,
          index: i,
          start: i * ROW_HEIGHT,
          size: ROW_HEIGHT,
        }))
      : [];

  const totalHeight = hasVirtualRows
    ? virtualizer.getTotalSize()
    : isSmallDataset
      ? visibleRows.length * ROW_HEIGHT
      : 0;

  const colCount = columns.length + 1;

  // ── Render ──

  return (
    <div className="gsl-bulk-import__step gsl-bulk-import__step--validate">
      <div className="gsl-bulk-import__step-header">
        <h3 className="gsl-bulk-import__step-title">Validate data</h3>
        {discardedRows.length > 0 && (
          <Button variant="outline" size="sm" onClick={onResetDiscardedRows}>
            Reset discarded rows
          </Button>
        )}
      </div>

      <div className="gsl-bulk-import__validate-toolbar">
        <div className="gsl-bulk-import__validate-actions">
          <Button
            variant="outline"
            size="sm"
            disabled={!someSelected}
            onClick={handleDiscard}
          >
            Discard selected rows
            {someSelected && selection !== "ALL" && ` (${selection.size})`}
          </Button>
          <label className="gsl-bulk-import__switch">
            <input
              type="checkbox"
              role="switch"
              className="gsl-bulk-import__switch-input"
              checked={showOnlyErrors}
              onChange={(event) => setShowOnlyErrors(event.target.checked)}
            />
            <span className="gsl-bulk-import__switch-track" aria-hidden="true">
              <span className="gsl-bulk-import__switch-thumb" />
            </span>
            <span className="gsl-bulk-import__switch-label">
              Show only rows with errors{" "}
              {rowsWithErrors.size > 0 && `(${rowsWithErrors.size})`}
            </span>
          </label>
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="gsl-bulk-import__validate-empty-wrap">
          <p className="gsl-bulk-import__validate-empty">
            {showOnlyErrors ? "No rows with errors." : "No rows to validate."}
          </p>
          {showOnlyErrors && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyErrors(false)}
            >
              Show all rows
            </Button>
          )}
        </div>
      ) : (
        <div className="gsl-bulk-import__table-wrap--validate">
          <div ref={scrollRef} className="gsl-bulk-import__validate-scroll">
            <table className="gsl-bulk-import__validate-table">
              <thead>
                <tr>
                  <th className="gsl-bulk-import__validate-th-checkbox">
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
                    <th key={col.key} className="gsl-bulk-import__validate-th">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="gsl-bulk-import__validate-spacer-row" style={{ height: totalHeight }}>
                  <td colSpan={colCount} className="gsl-bulk-import__validate-spacer-td">
                    {items.map((item) => {
                      const { row, rowId } = visibleRows[item.index];
                      const isSelected =
                        selection === "ALL" || selection.has(rowId);

                      return (
                        <div
                          key={item.key}
                          data-index={item.index}
                          className="gsl-bulk-import__validate-row-container"
                          style={{
                            height: `${item.size}px`,
                            transform: `translateY(${item.start}px)`,
                          }}
                        >
                          <table className="gsl-bulk-import__validate-row-table">
                            <tbody>
                              <tr
                                data-selected={isSelected || undefined}
                                className={[
                                  "gsl-bulk-import__data-row",
                                  isSelected
                                    ? "gsl-bulk-import__data-row--selected"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                style={{ height: ROW_HEIGHT }}
                              >
                                <td className="gsl-bulk-import__validate-td-checkbox">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      handleToggleRow(rowId)
                                    }
                                    aria-label="Select row"
                                  />
                                </td>
                                {visibleFields.map((field) => {
                                  const cellKey = `${rowId}:${field.key}`;
                                  const errorMessage = mergedErrors.get(cellKey);

                                  return (
                                    <td
                                      key={field.key}
                                      className={[
                                        "gsl-bulk-import__validate-td",
                                        errorMessage
                                          ? "gsl-bulk-import__cell--error"
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                      >
                                      <CellInput
                                        rowId={rowId}
                                        fieldKey={field.key}
                                        baseValue={String(
                                          row[field.key] ?? "",
                                        )}
                                        errorMessage={errorMessage}
                                        ariaLabel={`${field.label}, row ${rowId}`}
                                        dirtyCellsRef={dirtyCellsRef}
                                        onDirty={handleDirty}
                                      />
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
