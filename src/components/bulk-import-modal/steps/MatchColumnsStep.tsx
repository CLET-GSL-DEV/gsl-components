import type {
  BulkImportField,
  SourceColumn,
  SourceColumnMapping,
} from "../../../types/bulk-import-modal";

interface MatchColumnsStepProps {
  fields: BulkImportField[];
  allSourceColumns: SourceColumn[];
  previewRows: string[][];
  sourceColumnMapping: SourceColumnMapping;
  excludedColumns: number[];
  onSourceMappingChange: (sourceIndex: number, fieldKey: string | null) => void;
  onToggleExcludedColumn: (sourceIndex: number) => void;
}

function MappingStatus({ mapped }: { mapped: boolean }) {
  if (mapped) {
    return (
      <span className="gsl-bulk-import__mapping-status gsl-bulk-import__mapping-status--complete" aria-hidden="true">
        ✓
      </span>
    );
  }

  return (
    <span className="gsl-bulk-import__mapping-status gsl-bulk-import__mapping-status--pending" aria-hidden="true" />
  );
}

export function MatchColumnsStep({
  fields,
  allSourceColumns,
  previewRows,
  sourceColumnMapping,
  excludedColumns,
  onSourceMappingChange,
  onToggleExcludedColumn,
}: MatchColumnsStepProps) {
  const visibleColumns = allSourceColumns.filter(
    (column) => !excludedColumns.includes(column.index),
  );
  const previewLimit = previewRows.slice(0, 2);

  return (
    <div className="gsl-bulk-import__step">
      <h3 className="gsl-bulk-import__step-title">Match Columns</h3>

      <div className="gsl-bulk-import__match-grid">
        <div className="gsl-bulk-import__match-section">
          <p className="gsl-bulk-import__match-heading">Your table</p>
          <div className="gsl-bulk-import__match-columns">
            {visibleColumns.map((column) => (
              <div key={column.index} className="gsl-bulk-import__source-column">
                <div className="gsl-bulk-import__source-column-header">
                  <span className="gsl-bulk-import__source-column-label">
                    {column.label}
                  </span>
                  <button
                    type="button"
                    className="gsl-bulk-import__exclude-column"
                    aria-label={`Exclude column ${column.label}`}
                    onClick={() => onToggleExcludedColumn(column.index)}
                  >
                    ×
                  </button>
                </div>
                <div className="gsl-bulk-import__source-column-preview">
                  {previewLimit.map((row, rowIndex) => (
                    <span key={rowIndex}>{row[column.index] ?? ""}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gsl-bulk-import__match-section">
          <p className="gsl-bulk-import__match-heading">Will become</p>
          <div className="gsl-bulk-import__match-columns">
            {visibleColumns.map((column) => {
              const mappedFieldKey = sourceColumnMapping[column.index] ?? "";
              const isMapped = mappedFieldKey.length > 0;

              return (
                <div key={column.index} className="gsl-bulk-import__target-column">
                  <div className="gsl-bulk-import__target-column-control">
                    <select
                      className="gsl-bulk-import__select"
                      aria-label={`Map ${column.label} to a field`}
                      value={mappedFieldKey}
                      onChange={(event) => {
                        const value = event.target.value;
                        onSourceMappingChange(
                          column.index,
                          value === "" ? null : value,
                        );
                      }}
                    >
                      <option value="">Select column...</option>
                      {fields.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    <MappingStatus mapped={isMapped} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
