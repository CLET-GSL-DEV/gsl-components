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
  onShowOnlyErrorsChange: (value: boolean) => void;
  onDiscardSelectedRows: () => void;
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
  onShowOnlyErrorsChange,
  onDiscardSelectedRows,
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

  return (
    <div className="gsl-bulk-import__step">
      <div className="gsl-bulk-import__validate-header">
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

          <label className="gsl-bulk-import__toggle">
            <input
              type="checkbox"
              checked={showOnlyErrors}
              onChange={(event) => onShowOnlyErrorsChange(event.target.checked)}
            />
            <span>Show only rows with errors</span>
          </label>
        </div>
      </div>

      <div className="gsl-bulk-import__table-wrap gsl-bulk-import__table-wrap--validate">
        <table className="gsl-bulk-import__table gsl-bulk-import__table--validate">
          <thead>
            <tr>
              <th scope="col" className="gsl-bulk-import__checkbox-cell">
                <span className="gsl-bulk-import__sr-only">Select row</span>
              </th>
              {visibleFields.map((field) => (
                <th key={field.key} scope="col">
                  {field.label.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(({ row, rowId }) => (
              <tr key={rowId}>
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
                      {row[field.key] ?? ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
