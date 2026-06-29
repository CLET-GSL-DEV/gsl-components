import { useCallback, useMemo, useRef } from "react";
import { useConfirmBeforeUnload } from "../../hooks/useConfirmBeforeUnload";
import { ChevronLeft } from "lucide-react";
import {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalTitle,
  ModalFooter,
  ModalBody,
} from "../modal/Modal";
import { Button } from "../button/Button";
import { ProgressModal } from "../table/ProgressModal";
import type { BulkImportModalProps } from "../../types/bulk-import-modal";
import { BulkImportStep } from "../../types/bulk-import-modal";
import { useBulkImportFlow } from "./hooks/useBulkImportFlow";
import {
  getMappedFieldKeys,
  buildAllSourceColumns,
} from "./utils/mapRowsToRecords";
import { MatchColumnsStep } from "./steps/MatchColumnsStep";
import { SelectHeaderRowStep } from "./steps/SelectHeaderRowStep";
import { UploadStep } from "./steps/UploadStep";
import { ValidateDataStep } from "./steps/ValidateDataStep";
import "./styles/bulk-import-modal.css";

const STEPS = [
  { id: BulkImportStep.UPLOAD, label: "Upload Document" },
  { id: BulkImportStep.SELECT_HEADER_ROW, label: "Select header row" },
  { id: BulkImportStep.MATCH_COLUMNS, label: "Match Columns" },
  { id: BulkImportStep.VALIDATE_DATA, label: "Validate data" },
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
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE,
  allowImportWithWarnings = false,
  className,
  defaultState,
}: BulkImportModalProps) {
  const flow = useBulkImportFlow({
    fields,
    maxFileSizeBytes,
    open,
    defaultState,
  });

  const flowRef = useRef(flow);
  flowRef.current = flow;

  const hasUnsavedProgress = flow.parsed !== null;

  useConfirmBeforeUnload(hasUnsavedProgress);

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
    () => getMappedFieldKeys(flow.sourceColumnMapping, flow.excludedColumns),
    [flow.sourceColumnMapping, flow.excludedColumns],
  );

  const canConfirm =
    flow.canImport ||
    (allowImportWithWarnings && flow.validationWarnings.length > 0);

  const handleConfirm = useCallback(() => {
    if (!canConfirm && flowRef.current.validationErrors.length > 0) {
      return;
    }

    onComplete(flowRef.current.buildResult());
    onOpenChange(false);
  }, [canConfirm, onComplete, onOpenChange]);

  const handleFileSelected = useCallback(
    (file: File) => {
      void flowRef.current.handleFile(file);
    },
    [],
  );

  const handleGoNext = useCallback(() => {
    flowRef.current.goNext();
  }, []);

  const handleGoBack = useCallback(() => {
    flowRef.current.goBack();
  }, []);

  const handleRemoveFile = useCallback(() => {
    flowRef.current.removeFile();
  }, []);

  const handleGoToStep = useCallback((targetStep: number) => {
    flowRef.current.goToStep(targetStep as 1 | 2 | 3 | 4);
  }, []);

  const preventOverlayClose = useCallback(
    (event: Event) => event.preventDefault(),
    [],
  );

  const dialogClass = ["gsl-bulk-import", className].filter(Boolean).join(" ");

  const bodyStepClass = useMemo(() => {
    const map: Record<number, string> = {
      [BulkImportStep.UPLOAD]: "gsl-bulk-import__body--upload",
      [BulkImportStep.SELECT_HEADER_ROW]: "gsl-bulk-import__body--header",
      [BulkImportStep.MATCH_COLUMNS]: "gsl-bulk-import__body--match",
      [BulkImportStep.VALIDATE_DATA]: "gsl-bulk-import__body--validate",
    };
    return map[flow.step] ?? "";
  }, [flow.step]);

  return (
    <>
      <ProgressModal
        open={flow.isProcessingLarge}
        progress={flow.processingProgress}
      />

      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent
            className={dialogClass}
            showCloseButton
            preventClose={hasUnsavedProgress}
            preventCloseTitle="Exit import flow"
            preventCloseDescription="Are you sure? Your current information will not be saved."
            onOpenChange={onOpenChange}
            onInteractOutside={preventOverlayClose}
            aria-describedby={undefined}
          >
            <ModalTitle className="gsl-bulk-import__header">
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
                          isComplete
                            ? "gsl-bulk-import__stepper-item--complete"
                            : "",
                          canClick
                            ? "gsl-bulk-import__stepper-item--clickable"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-current={isActive ? "step" : undefined}
                      >
                        {canClick ? (
                          <button
                            type="button"
                            className="gsl-bulk-import__stepper-button"
                            onClick={() => handleGoToStep(stepItem.id)}
                            aria-label={`Go to step ${stepItem.id}: ${stepItem.label}`}
                          >
                            <span className="gsl-bulk-import__stepper-marker">
                              <span
                                className={[
                                  "gsl-bulk-import__stepper-number",
                                  isComplete
                                    ? "gsl-bulk-import__stepper-number--hidden"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                aria-hidden={isComplete}
                              >
                                {stepItem.id}
                              </span>
                              {isComplete && <CheckmarkIcon />}
                            </span>
                            <span className="gsl-bulk-import__stepper-label">
                              {stepItem.label}
                            </span>
                          </button>
                        ) : (
                          <>
                            <span className="gsl-bulk-import__stepper-marker">
                              <span
                                className={[
                                  "gsl-bulk-import__stepper-number",
                                  isComplete
                                    ? "gsl-bulk-import__stepper-number--hidden"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                aria-hidden={isComplete}
                              >
                                {stepItem.id}
                              </span>
                              {isComplete && <CheckmarkIcon />}
                            </span>
                            <span className="gsl-bulk-import__stepper-label">
                              {stepItem.label}
                            </span>
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
            </ModalTitle>

            <ModalBody
              className={["gsl-bulk-import__body", bodyStepClass].filter(Boolean).join(" ")}
            >
              {flow.step === BulkImportStep.UPLOAD && (
                  <UploadStep
                  fields={fields}
                  parseError={flow.parseError}
                  isParsing={flow.isParsing}
                  maxFileSizeBytes={maxFileSizeBytes}
                  onFileSelected={handleFileSelected}
                  uploadedFile={flow.uploadedFile}
                  onRemoveFile={handleRemoveFile}
                />
              )}

              {flow.step === BulkImportStep.SELECT_HEADER_ROW && flow.parsed && (
                <SelectHeaderRowStep
                  rows={flow.parsed.rows}
                  headerRowIndex={flow.headerRowIndex}
                  onSelectHeaderRow={flow.setHeaderRowIndex}
                />
              )}

              {flow.step === BulkImportStep.MATCH_COLUMNS && flow.parsed && (
                <MatchColumnsStep
                  fields={fields}
                  allSourceColumns={allSourceColumns}
                  previewRows={previewRows}
                  sourceColumnMapping={flow.sourceColumnMapping}
                  excludedColumns={flow.excludedColumns}
                  onSourceMappingChange={flow.updateSourceMapping}
                  onToggleExcludedColumn={flow.toggleExcludedColumn}
                  onResetMapping={flow.autoMapColumns}
                />
              )}

              {flow.step === BulkImportStep.VALIDATE_DATA && (
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
                  onResetDiscardedRows={flow.resetDiscardedRows}
                  onUpdateRowValue={flow.updateRowValue}
                />
              )}
            </ModalBody>

            {flow.step > BulkImportStep.UPLOAD && (
              <ModalFooter className="gsl-bulk-import__footer">
                <Button
                  variant="outline"
                  size="md"
                  className="gsl-bulk-import__footer-action"
                  onClick={handleGoBack}
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                  Back
                </Button>
                {flow.step < BulkImportStep.VALIDATE_DATA ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="gsl-bulk-import__footer-action"
                    disabled={!flow.canGoNext}
                    onClick={handleGoNext}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    className="gsl-bulk-import__footer-action"
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                  >
                    Confirm
                  </Button>
                )}
              </ModalFooter>
            )}
          </ModalContent>
        </ModalPortal>
      </Modal>
    </>
  );
}
