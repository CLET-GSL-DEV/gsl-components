import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { BulkImportModalProps } from "../../types/bulk-import-modal";
import { useBulkImportFlow } from "./hooks/useBulkImportFlow";
import { getMappedFieldKeys, buildAllSourceColumns } from "./utils/mapRowsToRecords";
import { MatchColumnsStep } from "./steps/MatchColumnsStep";
import { SelectHeaderRowStep } from "./steps/SelectHeaderRowStep";
import { UploadStep } from "./steps/UploadStep";
import { ValidateDataStep } from "./steps/ValidateDataStep";
import "./styles/bulk-import-modal.css";

const STEPS = [
  { id: 1, label: "Upload Document" },
  { id: 2, label: "Select header row" },
  { id: 3, label: "Match Columns" },
  { id: 4, label: "Validate data" },
] as const;

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

function CheckmarkIcon() {
  return (
    <svg
      className="gsl-bulk-import__stepper-check"
      width="14"
      height="14"
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
  );
}

export function BulkImportModal({
  open,
  onOpenChange,
  fields,
  onComplete,
  title = "Bulk import",
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE,
  allowImportWithWarnings = false,
  className,
}: BulkImportModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const flow = useBulkImportFlow({
    fields,
    maxFileSizeBytes,
    open,
  });

  const allSourceColumns = useMemo(() => {
    if (!flow.parsed || flow.headerRowIndex === null) {
      return [];
    }

    return buildAllSourceColumns(flow.parsed.rows, flow.headerRowIndex);
  }, [flow.parsed, flow.headerRowIndex]);

  const previewRows = useMemo(() => {
    if (!flow.parsed || flow.headerRowIndex === null) {
      return [];
    }

    return flow.parsed.rows.slice(flow.headerRowIndex + 1);
  }, [flow.parsed, flow.headerRowIndex]);

  const mappedFieldKeys = useMemo(
    () =>
      getMappedFieldKeys(flow.sourceColumnMapping, flow.excludedColumns),
    [flow.sourceColumnMapping, flow.excludedColumns],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open, flow.step]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const canConfirm =
    flow.canImport ||
    (allowImportWithWarnings && flow.validationWarnings.length > 0);

  const handleConfirm = () => {
    if (!canConfirm && flow.validationErrors.length > 0) {
      return;
    }

    onComplete(flow.buildResult());
    onOpenChange(false);
  };

  return createPortal(
    <div className="gsl-bulk-import__overlay" onClick={() => onOpenChange(false)}>
      <div
        ref={dialogRef}
        className={["gsl-bulk-import", className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="gsl-bulk-import__close"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
        >
          ×
        </button>

        <header className="gsl-bulk-import__header">
          <nav className="gsl-bulk-import__stepper" aria-label="Import steps">
            <ol className="gsl-bulk-import__stepper-list">
              {STEPS.map((step, index) => {
                const isActive = flow.step === step.id;
                const isComplete = flow.step > step.id;
                const isLast = index === STEPS.length - 1;
                return (
                  <li
                    key={step.id}
                    className={[
                      "gsl-bulk-import__stepper-item",
                      isActive ? "gsl-bulk-import__stepper-item--active" : "",
                      isComplete ? "gsl-bulk-import__stepper-item--complete" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className="gsl-bulk-import__stepper-marker">
                      {isComplete ? <CheckmarkIcon /> : step.id}
                    </span>
                    <span className="gsl-bulk-import__stepper-label">{step.label}</span>
                    {!isLast && (
                      <span
                        className={[
                          "gsl-bulk-import__stepper-connector",
                          isComplete
                            ? "gsl-bulk-import__stepper-connector--complete"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </header>

        <div className="gsl-bulk-import__body">
          {flow.step === 1 && (
            <UploadStep
              fields={fields}
              fileName={flow.parsed?.fileName ?? null}
              parseError={flow.parseError}
              isParsing={flow.isParsing}
              onFileSelected={(file) => void flow.handleFile(file)}
            />
          )}

          {flow.step === 2 && flow.parsed && (
            <SelectHeaderRowStep
              rows={flow.parsed.rows}
              headerRowIndex={flow.headerRowIndex}
              onSelectHeaderRow={flow.setHeaderRowIndex}
            />
          )}

          {flow.step === 3 && flow.parsed && (
            <MatchColumnsStep
              fields={fields}
              allSourceColumns={allSourceColumns}
              previewRows={previewRows}
              sourceColumnMapping={flow.sourceColumnMapping}
              excludedColumns={flow.excludedColumns}
              onSourceMappingChange={flow.updateSourceMapping}
              onToggleExcludedColumn={flow.toggleExcludedColumn}
            />
          )}

          {flow.step === 4 && (
            <ValidateDataStep
              fields={fields}
              mappedFieldKeys={mappedFieldKeys}
              mappedRows={flow.mappedRows}
              errors={flow.validationErrors}
              selectedRowIds={flow.selectedRowIds}
              showOnlyErrors={flow.showOnlyErrors}
              discardedRows={flow.discardedRows}
              onToggleRowSelection={flow.toggleRowSelection}
              onShowOnlyErrorsChange={flow.setShowOnlyErrors}
              onDiscardSelectedRows={flow.discardSelectedRows}
            />
          )}
        </div>

        {flow.step > 1 && (
          <footer className="gsl-bulk-import__footer">
            {flow.step < 4 ? (
              <button
                type="button"
                className="gsl-bulk-import__button gsl-bulk-import__button--primary gsl-bulk-import__footer-action"
                disabled={!flow.canGoNext}
                onClick={flow.goNext}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="gsl-bulk-import__button gsl-bulk-import__button--primary gsl-bulk-import__footer-action"
                disabled={!canConfirm}
                onClick={handleConfirm}
              >
                Confirm
              </button>
            )}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
