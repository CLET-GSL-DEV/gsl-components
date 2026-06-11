import { useState } from "react";
import type {
  BulkImportField,
  SourceColumn,
  SourceColumnMapping,
} from "../../../types/bulk-import-modal";
import { Dropdown } from "../../dropdown/Dropdown";

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
  return (
    <span
      key={mapped ? "complete" : "pending"}
      className={[
        "gsl-bulk-import__mapping-status",
        mapped
          ? "gsl-bulk-import__mapping-status--complete"
          : "gsl-bulk-import__mapping-status--pending",
      ].join(" ")}
      aria-hidden="true"
    >
      {mapped ? (
        <svg
          className="gsl-bulk-import__mapping-status-check"
          width="12"
          height="12"
          viewBox="0 0 14 14"
          aria-hidden="true"
        >
          <path
            d="M2 7.5L5.5 11L12 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

function formatPreviewValue(value: string | undefined): string {
  return value?.trim() ? value.trim() : "—";
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
  const [openColumnIndex, setOpenColumnIndex] = useState<number | null>(null);

  const visibleColumns = allSourceColumns.filter(
    (column) => !excludedColumns.includes(column.index),
  );
  const previewLimit = previewRows.slice(0, 2);
  const fieldOptions = fields.map((field) => ({
    value: field.key,
    label: field.label,
  }));

  return (
    <div className="gsl-bulk-import__step gsl-bulk-import__step--match">
      <h3 className="gsl-bulk-import__step-title">Match Columns</h3>

      <div className="gsl-bulk-import__match-layout">
        <div className="gsl-bulk-import__match-board">
          <p className="gsl-bulk-import__match-heading">Your table</p>
          <div className="gsl-bulk-import__match-scroll">
            <div className="gsl-bulk-import__match-track gsl-bulk-import__match-track--source">
              {visibleColumns.map((column) => (
                <div
                  key={column.index}
                  className="gsl-bulk-import__match-column gsl-bulk-import__source-column"
                >
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
                      <span
                        key={rowIndex}
                        className="gsl-bulk-import__source-column-preview-row"
                      >
                        {formatPreviewValue(row[column.index])}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="gsl-bulk-import__match-heading gsl-bulk-import__match-heading--target">
            Will become
          </p>
          <div className="gsl-bulk-import__match-scroll gsl-bulk-import__match-scroll--target">
            <div className="gsl-bulk-import__match-track gsl-bulk-import__match-track--target">
              {visibleColumns.map((column) => {
                const mappedFieldKey = sourceColumnMapping[column.index] ?? null;
                const isMapped = mappedFieldKey !== null;

                return (
                  <div
                    key={column.index}
                    className="gsl-bulk-import__match-column gsl-bulk-import__target-column"
                  >
                    <div className="gsl-bulk-import__target-column-control">
                      <Dropdown
                        ariaLabel={`Map ${column.label} to a field`}
                        value={mappedFieldKey}
                        options={fieldOptions}
                        clearable
                        placeholder="Select column..."
                        open={openColumnIndex === column.index}
                        onOpenChange={(open) =>
                          setOpenColumnIndex(open ? column.index : null)
                        }
                        onChange={(fieldKey) =>
                          onSourceMappingChange(column.index, fieldKey)
                        }
                      />
                      <MappingStatus mapped={isMapped} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
