import { useCallback } from "react";
import type {
  BulkImportField,
  SourceColumn,
  SourceColumnMapping,
} from "../../../types/bulk-import-modal";
import { Button } from "../../button/Button";
import { FieldMappingSelect } from "../internal/FieldMappingSelect";

interface MatchColumnsStepProps {
  fields: BulkImportField[];
  allSourceColumns: SourceColumn[];
  previewRows: string[][];
  sourceColumnMapping: SourceColumnMapping;
  excludedColumns: number[];
  onSourceMappingChange: (sourceIndex: number, fieldKey: string | null) => void;
  onToggleExcludedColumn: (sourceIndex: number) => void;
  onResetMapping: () => void;
}

function MappingStatus({ mapped }: { mapped: boolean }) {
  return (
    <span
      key={mapped ? "complete" : "pending"}
      className={[
        "clet-bulk-import__mapping-status gsl-bulk-import__mapping-status",
        mapped
          ? "clet-bulk-import__mapping-status--complete gsl-bulk-import__mapping-status--complete"
          : "clet-bulk-import__mapping-status--pending gsl-bulk-import__mapping-status--pending",
      ].join(" ")}
      aria-hidden="true"
    >
      {mapped ? (
        <svg
          className="clet-bulk-import__mapping-status-check gsl-bulk-import__mapping-status-check"
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

function openLinkedDropdown(columnIndex: number) {
  const control = document.querySelector<HTMLElement>(
    `.clet-bulk-import__target-column-control[data-column-index="${columnIndex}"]`,
  );
  if (!control) return;

  const trigger = control.querySelector<HTMLButtonElement>(
    ".clet-dropdown__trigger",
  );
  trigger?.click();
}

export function MatchColumnsStep({
  fields,
  allSourceColumns,
  previewRows,
  sourceColumnMapping,
  excludedColumns,
  onSourceMappingChange,
  onToggleExcludedColumn,
  onResetMapping,
}: MatchColumnsStepProps) {
  const visibleColumns = allSourceColumns.filter(
    (column) => !excludedColumns.includes(column.index),
  );
  const previewLimit = previewRows.slice(0, 2);
  const fieldOptions = fields.map((field) => ({
    value: field.key,
    label: field.label,
  }));

  const formatOption = useCallback(
    (
      option: { value: string; label: string } | null,
      state: "selected" | "idle" | "empty",
    ) => (
      <span className="clet-bulk-import__match-colum-dropdown-label gsl-bulk-import__match-colum-dropdown-label">
        {state !== "idle" && <MappingStatus mapped={state === "selected"} />}
        <span>{state === "empty" ? "Select Column" : option?.label}</span>
      </span>
    ),
    [],
  );

  return (
    <div className="clet-bulk-import__step gsl-bulk-import__step clet-bulk-import__step--match gsl-bulk-import__step--match">
      <div className="clet-bulk-import__step-header gsl-bulk-import__step-header">
        <h3 className="clet-bulk-import__step-title gsl-bulk-import__step-title">Match Columns</h3>
        <Button variant="outline" size="sm" onClick={onResetMapping}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          Reset mapping
        </Button>
      </div>
      <p className="clet-bulk-import__match-toolbar-hint gsl-bulk-import__match-toolbar-hint">
        Map each column to a field, or exclude unused columns with the × button.
        All columns must be mapped before proceeding.
      </p>

      <div className="clet-bulk-import__match-layout gsl-bulk-import__match-layout">
        <div className="clet-bulk-import__match-board gsl-bulk-import__match-board">
          <p className="clet-bulk-import__match-heading gsl-bulk-import__match-heading">Your table</p>
          <div className="clet-bulk-import__match-track gsl-bulk-import__match-track clet-bulk-import__match-track--source gsl-bulk-import__match-track--source">
            {visibleColumns.map((column) => (
              <div
                key={column.index}
                className="clet-bulk-import__match-column gsl-bulk-import__match-column clet-bulk-import__source-column gsl-bulk-import__source-column"
                data-column-index={column.index}
                onClick={() => openLinkedDropdown(column.index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLinkedDropdown(column.index);
                  }
                }}
              >
                <div className="clet-bulk-import__source-column-header gsl-bulk-import__source-column-header">
                  <span className="clet-bulk-import__source-column-label gsl-bulk-import__source-column-label">
                    {column.label}
                  </span>
                  <button
                    type="button"
                    className="clet-bulk-import__exclude-column gsl-bulk-import__exclude-column"
                    aria-label={`Exclude column ${column.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExcludedColumn(column.index);
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="clet-bulk-import__source-column-preview gsl-bulk-import__source-column-preview">
                  {previewLimit.map((row, rowIndex) => (
                    <span
                      key={rowIndex}
                      className="clet-bulk-import__source-column-preview-row gsl-bulk-import__source-column-preview-row"
                    >
                      {formatPreviewValue(row[column.index])}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="clet-bulk-import__match-heading gsl-bulk-import__match-heading clet-bulk-import__match-heading--target gsl-bulk-import__match-heading--target">
            Will become
          </p>
          <div className="clet-bulk-import__match-track gsl-bulk-import__match-track clet-bulk-import__match-track--target gsl-bulk-import__match-track--target">
            {visibleColumns.map((column) => {
              const mappedFieldKey = sourceColumnMapping[column.index] ?? null;
              const isMapped = mappedFieldKey !== null;

              return (
                <div
                  key={column.index}
                  className="clet-bulk-import__match-column gsl-bulk-import__match-column clet-bulk-import__target-column gsl-bulk-import__target-column"
                >
                  <div
                    className="clet-bulk-import__target-column-control gsl-bulk-import__target-column-control"
                    data-column-index={column.index}
                  >
                    <FieldMappingSelect
                      ariaLabel={`Map ${column.label} to a field`}
                      value={mappedFieldKey}
                      options={fieldOptions}
                      clearable
                      placeholder="Select column..."
                      formatOption={formatOption}
                      invalid={!isMapped}
                      onChange={(fieldKey) =>
                        onSourceMappingChange(column.index, fieldKey)
                      }
                    />
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
