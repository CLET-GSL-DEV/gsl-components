import { useCallback, useMemo, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const flow = useBulkImportFlow({
    fields,
    maxFileSizeBytes,
    open,
  });

  const hasUnsavedProgress = flow.parsed !== null;

  const requestClose = useCallback(() => {
    if (!hasUnsavedProgress) {
      onOpenChange(false);
      return;
    }

    setShowExitConfirm(true);
  }, [hasUnsavedProgress, onOpenChange]);

  const confirmExit = useCallback(() => {
    setShowExitConfirm(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true);
        return;
      }

      if (!hasUnsavedProgress) {
        onOpenChange(false);
        return;
      }

      setShowExitConfirm(true);
    },
    [hasUnsavedProgress, onOpenChange],
  );

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

  const dialogClass = ["gsl-bulk-import", className].filter(Boolean).join(" ");

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleDialogOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="gsl-bulk-import__overlay" />
          <Dialog.Content className={dialogClass} aria-describedby={undefined}>
            <Dialog.Title className="gsl-bulk-import__dialog-title">
              {title}
            </Dialog.Title>

            <button
              type="button"
              className="gsl-bulk-import__close"
              aria-label="Close"
              onClick={requestClose}
            >
              ×
            </button>

            <header className="gsl-bulk-import__header">
              <nav className="gsl-bulk-import__stepper" aria-label="Import steps">
                <ol className="gsl-bulk-import__stepper-list">
                  {STEPS.map((stepItem, index) => {
                    const isActive = flow.step === stepItem.id;
                    const isComplete = flow.step > stepItem.id;
                    const isLast = index === STEPS.length - 1;
                    const canClick = isComplete;
                    return (
                      <li
                        key={stepItem.id}
                        className={[
                          "gsl-bulk-import__stepper-item",
                          isActive ? "gsl-bulk-import__stepper-item--active" : "",
                          isComplete ? "gsl-bulk-import__stepper-item--complete" : "",
                          canClick ? "gsl-bulk-import__stepper-item--clickable" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-current={isActive ? "step" : undefined}
                      >
                        {canClick ? (
                          <button
                            type="button"
                            className="gsl-bulk-import__stepper-button"
                            onClick={() => flow.goToStep(stepItem.id)}
                            aria-label={`Go to step ${stepItem.id}: ${stepItem.label}`}
                          >
                            <span className="gsl-bulk-import__stepper-marker">
                              <span
                                className={[
                                  "gsl-bulk-import__stepper-number",
                                  isComplete ? "gsl-bulk-import__stepper-number--hidden" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                aria-hidden={isComplete}
                              >
                                {stepItem.id}
                              </span>
                              {isComplete && <CheckmarkIcon />}
                            </span>
                            <span className="gsl-bulk-import__stepper-label">{stepItem.label}</span>
                          </button>
                        ) : (
                          <>
                            <span className="gsl-bulk-import__stepper-marker">
                              <span
                                className={[
                                  "gsl-bulk-import__stepper-number",
                                  isComplete ? "gsl-bulk-import__stepper-number--hidden" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                aria-hidden={isComplete}
                              >
                                {stepItem.id}
                              </span>
                              {isComplete && <CheckmarkIcon />}
                            </span>
                            <span className="gsl-bulk-import__stepper-label">{stepItem.label}</span>
                          </>
                        )}
                        {!isLast && (
                          <span
                            className="gsl-bulk-import__stepper-connector"
                            aria-hidden="true"
                          >
                            <span
                              className="gsl-bulk-import__stepper-connector-track"
                              aria-hidden="true"
                            />
                            <span
                              className={[
                                "gsl-bulk-import__stepper-connector-fill",
                                isComplete
                                  ? "gsl-bulk-import__stepper-connector-fill--visible"
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </header>

            <div
              className={[
                "gsl-bulk-import__body",
                flow.step === 1
                  ? "gsl-bulk-import__body--upload"
                  : flow.step === 2
                    ? "gsl-bulk-import__body--header"
                    : flow.step === 3
                      ? "gsl-bulk-import__body--match"
                      : flow.step === 4
                        ? "gsl-bulk-import__body--validate"
                        : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
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
                  mappedRows={flow.editableRows}
                  errors={flow.validationErrors}
                  selectedRowIds={flow.selectedRowIds}
                  showOnlyErrors={flow.showOnlyErrors}
                  discardedRows={flow.discardedRows}
                  onToggleRowSelection={flow.toggleRowSelection}
                  onSetVisibleRowsSelection={flow.setVisibleRowsSelection}
                  onShowOnlyErrorsChange={flow.setShowOnlyErrors}
                  onDiscardSelectedRows={flow.discardSelectedRows}
                  onUpdateRowValue={flow.updateRowValue}
                />
              )}
            </div>

            {flow.step > 1 && (
              <footer className="gsl-bulk-import__footer">
                <button
                  type="button"
                  className="gsl-bulk-import__button gsl-bulk-import__button--outline"
                  onClick={flow.goBack}
                >
                  Back
                </button>
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="gsl-bulk-import__exit-confirm-overlay" />
          <AlertDialog.Content className="gsl-bulk-import__exit-confirm">
            <AlertDialog.Title className="gsl-bulk-import__exit-confirm-title">
              Exit import flow
            </AlertDialog.Title>
            <AlertDialog.Description className="gsl-bulk-import__exit-confirm-message">
              Are you sure? Your current information will not be saved.
            </AlertDialog.Description>
            <div className="gsl-bulk-import__exit-confirm-actions">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="gsl-bulk-import__button gsl-bulk-import__button--ghost"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  className="gsl-bulk-import__button gsl-bulk-import__button--primary"
                  onClick={confirmExit}
                >
                  Exit flow
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
