import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
} from "react";
import { createPortal } from "react-dom";
import type { BulkImportModalProps } from "../../types/bulk-import-modal";
import { useBulkImportFlow } from "./hooks/useBulkImportFlow";
import { getMappedFieldKeys, buildAllSourceColumns } from "./utils/mapRowsToRecords";
import { MatchColumnsStep } from "./steps/MatchColumnsStep";
import { SelectHeaderRowStep } from "./steps/SelectHeaderRowStep";
import { UploadStep } from "./steps/UploadStep";
import { ValidateDataStep } from "./steps/ValidateDataStep";
import "../../styles/theme.css";
import "./styles/bulk-import-modal.css";

const STEPS = [
  { id: 1, label: "Upload Document" },
  { id: 2, label: "Select header row" },
  { id: 3, label: "Match Columns" },
  { id: 4, label: "Validate data" },
] as const;

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

type ModalPhase = "closed" | "open" | "closing";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

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
  const overlayRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<ModalPhase>(open ? "open" : "closed");
  const [phase, setPhase] = useState<ModalPhase>(() => (open ? "open" : "closed"));
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const isRendered = phase !== "closed";
  phaseRef.current = phase;

  const flow = useBulkImportFlow({
    fields,
    maxFileSizeBytes,
    open: isRendered,
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
    if (open) {
      setPhase("open");
      return;
    }

    setShowExitConfirm(false);

    if (prefersReducedMotion()) {
      setPhase("closed");
      return;
    }

    setPhase((current) => (current === "open" ? "closing" : current));
  }, [open]);

  const handleOverlayAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== overlayRef.current) {
      return;
    }

    if (phaseRef.current === "closing") {
      setPhase("closed");
    }
  };

  useEffect(() => {
    if (!isRendered) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (showExitConfirm) {
          setShowExitConfirm(false);
        } else {
          requestClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, requestClose, showExitConfirm]);

  useEffect(() => {
    if (phase === "open") {
      dialogRef.current?.focus();
    }
  }, [phase, flow.step]);

  if (!isRendered || typeof document === "undefined") {
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

  const handleOverlayClick = () => {
    if (showExitConfirm) {
      setShowExitConfirm(false);
      return;
    }

    requestClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={[
        "gsl-bulk-import__overlay",
        phase === "closing" ? "gsl-bulk-import__overlay--closing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleOverlayClick}
      onAnimationEnd={handleOverlayAnimationEnd}
    >
      <div
        ref={dialogRef}
        className={[
          "gsl-bulk-import",
          phase === "closing" ? "gsl-bulk-import--closing" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
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
          onClick={requestClose}
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
                      <span
                        className={[
                          "gsl-bulk-import__stepper-number",
                          isComplete ? "gsl-bulk-import__stepper-number--hidden" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden={isComplete}
                      >
                        {step.id}
                      </span>
                      {isComplete && <CheckmarkIcon />}
                    </span>
                    <span className="gsl-bulk-import__stepper-label">{step.label}</span>
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
              onShowOnlyErrorsChange={flow.setShowOnlyErrors}
              onDiscardSelectedRows={flow.discardSelectedRows}
              onUpdateRowValue={flow.updateRowValue}
            />
          )}
        </div>

        {showExitConfirm && (
          <div
            className="gsl-bulk-import__exit-confirm-overlay"
            onClick={() => setShowExitConfirm(false)}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="gsl-bulk-import-exit-confirm-title"
              aria-describedby="gsl-bulk-import-exit-confirm-desc"
              className="gsl-bulk-import__exit-confirm"
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="gsl-bulk-import-exit-confirm-title"
                className="gsl-bulk-import__exit-confirm-title"
              >
                Exit import flow
              </h2>
              <p
                id="gsl-bulk-import-exit-confirm-desc"
                className="gsl-bulk-import__exit-confirm-message"
              >
                Are you sure? Your current information will not be saved.
              </p>
              <div className="gsl-bulk-import__exit-confirm-actions">
                <button
                  type="button"
                  className="gsl-bulk-import__button gsl-bulk-import__button--ghost"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="gsl-bulk-import__button gsl-bulk-import__button--primary"
                  onClick={confirmExit}
                >
                  Exit flow
                </button>
              </div>
            </div>
          </div>
        )}

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
