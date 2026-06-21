import { useMemo } from "react";
import {
  Table,
  TableContent,
  TableFooter,
} from "../../table/Table";
import { TableBulkActions } from "../../table/TableBulkActions";
import type { TableColumn, TableBulkAction } from "../../../types/table";
import type {
  BulkImportField,
  BulkImportValidationError,
} from "../../../types/bulk-import-modal";

interface ValidateRow {
  _rowId: number;
  [fieldKey: string]: string | number;
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
  onUpdateRowValue: (rowId: number, fieldKey: string, value: string) => void;
}

function buildErrorMap(errors: BulkImportValidationError[]) {
  const map = new Map<string, string>();
  for (const issue of errors) {
    map.set(`${issue.row}:${issue.fieldKey}`, issue.message);
  }
  return map;
}

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
  onUpdateRowValue,
}: ValidateDataStepProps) {
  const errorMap = buildErrorMap(errors);
  const rowsWithErrors = new Set(errors.map((issue) => issue.row));
  const visibleFields = fields.filter((field) =>
    mappedFieldKeys.includes(field.key),
  );

  const handleClearSelection = useMemo(
    () => () => onSetVisibleRowsSelection([], false),
    [onSetVisibleRowsSelection],
  );

  const bulkActions: TableBulkAction[] = useMemo(
    () => [
      {
        id: "discard",
        label: "Discard",
        destructive: true,
        onClick: () => {
          onDiscardSelectedRows();
          handleClearSelection();
        },
      },
    ],
    [onDiscardSelectedRows, handleClearSelection],
  );

  const visibleRows = useMemo(
    () =>
      mappedRows
        .map((row, index) => ({ row, rowId: index + 1 }))
        .filter(({ rowId }) => !discardedRows.includes(rowId))
        .filter(
          ({ rowId }) => !showOnlyErrors || rowsWithErrors.has(rowId),
        ),
    [mappedRows, discardedRows, showOnlyErrors, rowsWithErrors],
  );

  const visibleRowIds = visibleRows.map(({ rowId }) => rowId);

  const selectedIdsSet = useMemo(
    () => new Set<string | number>(selectedRowIds),
    [selectedRowIds],
  );

  const tableData: ValidateRow[] = useMemo(
    () =>
      visibleRows.map(({ row, rowId }) => {
        const record: ValidateRow = { _rowId: rowId };
        for (const field of visibleFields) {
          record[field.key] = row[field.key] ?? "";
        }
        return record;
      }),
    [visibleRows, visibleFields],
  );

  const tableColumns: TableColumn<ValidateRow>[] = useMemo(
    () =>
      visibleFields.map((field) => ({
        id: field.key,
        header: field.label.toUpperCase(),
        accessorKey: field.key as keyof ValidateRow,
        cell: ({ row, value }) => {
          const rowId = row._rowId as number;
          const errorMessage = errorMap.get(`${rowId}:${field.key}`);
          const cellClass = errorMessage
            ? "gsl-bulk-import__cell gsl-bulk-import__cell--error"
            : "gsl-bulk-import__cell";
          const inputClass = errorMessage
            ? "gsl-bulk-import__cell-input gsl-bulk-import__cell-input--error"
            : "gsl-bulk-import__cell-input";
          return (
            <div className={cellClass}>
              <input
                type="text"
                className={inputClass}
                value={String(value ?? "")}
                aria-invalid={errorMessage ? true : undefined}
                aria-label={`${field.label}, row ${rowId}`}
                onChange={(event) =>
                  onUpdateRowValue(rowId, field.key, event.target.value)
                }
              />
              {errorMessage ? (
                <span
                  className="gsl-bulk-import__cell-error-tooltip"
                  role="tooltip"
                >
                  {errorMessage}
                </span>
              ) : null}
            </div>
          );
        },
      })),
    [visibleFields, errorMap, onUpdateRowValue],
  );

  const handleSelectionChange = (next: Set<string | number>) => {
    const prev = new Set(selectedRowIds);

    const added = visibleRowIds.filter((id) => next.has(id) && !prev.has(id));
    const removed = visibleRowIds.filter(
      (id) => !next.has(id) && prev.has(id),
    );

    if (added.length === visibleRowIds.length && added.length > 0) {
      onSetVisibleRowsSelection(visibleRowIds, true);
      return;
    }
    if (removed.length === visibleRowIds.length && removed.length > 0) {
      onSetVisibleRowsSelection(visibleRowIds, false);
      return;
    }

    for (const id of added) onToggleRowSelection(id);
    for (const id of removed) onToggleRowSelection(id);
  };

  return (
    <div className="gsl-bulk-import__step gsl-bulk-import__step--validate">
      <div className="gsl-bulk-import__step-header">
        <h3 className="gsl-bulk-import__step-title">Validate data</h3>
        <div className="gsl-bulk-import__validate-toolbar">
          <span className={[
              "gsl-bulk-import__validate-err-count",
              errors.length > 0 && "gsl-bulk-import__validate-err-count--has-errors",
            ]
              .filter(Boolean)
              .join(" ")}>
            {errors.length > 0
              ? `${errors.length} error row${errors.length !== 1 ? "s" : ""} remaining`
              : "No errors"}
          </span>
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
            <span
              className="gsl-bulk-import__switch-track"
              aria-hidden="true"
            >
              <span className="gsl-bulk-import__switch-thumb" />
            </span>
            <span className="gsl-bulk-import__switch-label">
              Show only rows with errors
            </span>
          </label>
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <p className="gsl-bulk-import__validate-empty">
          {showOnlyErrors ? "No rows with errors." : "No rows to validate."}
        </p>
      ) : (
        <div className="gsl-bulk-import__table-wrap gsl-bulk-import__table-wrap--validate">
          <Table paramPrefix="validate">
            <TableContent<ValidateRow>
              columns={tableColumns}
              data={tableData}
              rowKey={(row) => row._rowId}
              selectable
              selectedIds={selectedIdsSet}
              onSelectionChange={handleSelectionChange}
              virtualize
              virtualRowHeight={44}
            />
            <TableBulkActions
              selectedIds={selectedIdsSet}
              selectedCount={selectedRowIds.length}
              onClear={handleClearSelection}
              actions={bulkActions}
            />
            <TableFooter>
              <span className="gsl-bulk-import__validate-footer-text">
                {visibleRows.length} row{visibleRows.length !== 1 ? "s" : ""}
                {errors.length > 0 && ` — ${errors.length} with errors`}
              </span>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
}
