import { useEffect, useRef } from "react";
import type {
  BulkImportField,
  BulkImportValidationError,
} from "../../../types/bulk-import-modal";

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

  const visibleRows = mappedRows
    .map((row, index) => ({ row, rowId: index + 1 }))
    .filter(({ rowId }) => !discardedRows.includes(rowId))
    .filter(({ rowId }) => !showOnlyErrors || rowsWithErrors.has(rowId));

  const visibleRowIds = visibleRows.map(({ rowId }) => rowId);
  const allVisibleSelected =
    visibleRowIds.length > 0 &&
    visibleRowIds.every((rowId) => selectedRowIds.includes(rowId));
  const someVisibleSelected = visibleRowIds.some((rowId) =>
    selectedRowIds.includes(rowId),
  );
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        someVisibleSelected && !allVisibleSelected;
    }
  }, [allVisibleSelected, someVisibleSelected]);

  return (
    <div className="gsl-bulk-import__step gsl-bulk-import__step--validate">
      <h3 className="gsl-bulk-import__step-title">Validate data</h3>

      <div className="gsl-bulk-import__validate-toolbar">
        <button
          type="button"
          className="gsl-bulk-import__button gsl-bulk-import__button--outline"
          disabled={selectedRowIds.length === 0}
          onClick={onDiscardSelectedRows}
        >
          Discard selected rows
        </button>

        <label className="gsl-bulk-import__switch">
          <input
            type="checkbox"
            role="switch"
            className="gsl-bulk-import__switch-input"
            checked={showOnlyErrors}
            onChange={(event) => onShowOnlyErrorsChange(event.target.checked)}
          />
          <span className="gsl-bulk-import__switch-track" aria-hidden="true">
            <span className="gsl-bulk-import__switch-thumb" />
          </span>
          <span className="gsl-bulk-import__switch-label">
            Show only rows with errors
          </span>
        </label>
      </div>

      <div className="gsl-bulk-import__validate-board">
        {visibleRows.length === 0 ? (
          <p className="gsl-bulk-import__validate-empty">
            {showOnlyErrors ? "No rows with errors." : "No rows to validate."}
          </p>
        ) : (
          <div className="gsl-bulk-import__table-wrap gsl-bulk-import__table-wrap--validate">
            <table className="gsl-bulk-import__table gsl-bulk-import__table--validate">
              <thead>
                <tr>
                  <th scope="col" className="gsl-bulk-import__checkbox-cell">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      disabled={visibleRowIds.length === 0}
                      aria-label="Select all rows"
                      onChange={(event) =>
                        onSetVisibleRowsSelection(
                          visibleRowIds,
                          event.target.checked,
                        )
                      }
                    />
                  </th>
                  {visibleFields.map((field) => (
                    <th key={field.key} scope="col">
                      {field.label.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map(({ row, rowId }) => {
                  const hasRowError = rowsWithErrors.has(rowId);
                  const isSelected = selectedRowIds.includes(rowId);

                  return (
                    <tr
                      key={rowId}
                      className={
                        [
                          hasRowError
                            ? "gsl-bulk-import__table-row--error"
                            : "",
                          isSelected
                            ? "gsl-bulk-import__table-row--selected"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                    >
                      <td className="gsl-bulk-import__checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedRowIds.includes(rowId)}
                          aria-label={`Select row ${rowId}`}
                          onChange={() => onToggleRowSelection(rowId)}
                        />
                      </td>
                      {visibleFields.map((field) => {
                        const errorMessage = errorMap.get(`${rowId}:${field.key}`);
                        return (
                          <td
                            key={field.key}
                            className={
                              errorMessage
                                ? "gsl-bulk-import__cell--error"
                                : undefined
                            }
                            title={errorMessage ?? undefined}
                          >
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
                              value={row[field.key] ?? ""}
                              aria-invalid={errorMessage ? true : undefined}
                              aria-label={`${field.label}, row ${rowId}`}
                              onChange={(event) =>
                                onUpdateRowValue(
                                  rowId,
                                  field.key,
                                  event.target.value,
                                )
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
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
