import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
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
import { ProgressBar } from "../progress-bar/ProgressBar";
import animationData from "../table/file_processing.json";
import type {
  BulkImportModalProps,
  BulkImportResult,
  SourceColumnMapping,
} from "../../types/bulk-import-modal";
import { BulkImportStep } from "../../types/bulk-import-modal";
import { useBulkImportFlow } from "./hooks/useBulkImportFlow";
import {
  autoMatchSourceColumns,
  buildAllSourceColumns,
} from "./utils/mapRowsToRecords";
import { MatchColumnsStep } from "./steps/MatchColumnsStep";
import { SelectHeaderRowStep } from "./steps/SelectHeaderRowStep";
import { UploadStep } from "./steps/UploadStep";
import { ValidateDataStep } from "./steps/ValidateDataStep";
import { DEFAULT_MAX_FILE_SIZE } from "./constants";
import "./styles/bulk-import-modal.css";

const STEPS = [
  { id: BulkImportStep.UPLOAD, label: "Upload Document" },
  { id: BulkImportStep.SELECT_HEADER_ROW, label: "Select header row" },
  { id: BulkImportStep.MATCH_COLUMNS, label: "Match Columns" },
  { id: BulkImportStep.VALIDATE_DATA, label: "Validate data" },
] as const;

const Lottie = lazy(() => import("lottie-react"));

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

  const loadingVerb = useMemo(() => {
    return flow.step === BulkImportStep.VALIDATE_DATA
      ? "records validated"
      : "rows parsed";
  }, [flow.step]);

  useConfirmBeforeUnload(hasUnsavedProgress);

  // Draft state stays local to BulkImportModal; committed to flow on Next.
  const dirtyCellsRef = useRef<Record<string, string>>({});
  const stepResultRef = useRef<() => BulkImportResult>(() => ({
    rows: [],
    errors: [],
    warnings: [],
  }));
  const [canConfirm, setCanConfirm] = useState(false);

  const [headerRowDraft, setHeaderRowDraft] = useState<number | null>(
    flow.headerRowIndex,
  );

  const [matchDraft, setMatchDraft] = useState<{
    mapping: SourceColumnMapping;
    excluded: number[];
  }>({
    mapping: flow.sourceColumnMapping,
    excluded: flow.excludedColumns,
  });

  // Sync drafts from committed flow state when stepping back
  useEffect(() => {
    setHeaderRowDraft(flow.headerRowIndex);
  }, [flow.headerRowIndex]);

  useEffect(() => {
    setMatchDraft({
      mapping: { ...flow.sourceColumnMapping },
      excluded: [...flow.excludedColumns],
    });
  }, [flow.sourceColumnMapping, flow.excludedColumns]);

  const allSourceColumns = useMemo(() => {
    if (!flow.parsed || headerRowDraft === null) return [];
    return buildAllSourceColumns(flow.parsed.rows, headerRowDraft);
  }, [flow.parsed, headerRowDraft]);

  const previewRows = useMemo(() => {
    if (!flow.parsed || headerRowDraft === null) return [];
    return flow.parsed.rows.slice(headerRowDraft + 1);
  }, [flow.parsed, headerRowDraft]);

  const activeMatchColumns = useMemo(
    () =>
      allSourceColumns.filter(
        (col) => !matchDraft.excluded.includes(col.index),
      ),
    [allSourceColumns, matchDraft.excluded],
  );

  const canGoNext = useMemo(() => {
    switch (flow.step) {
      case BulkImportStep.UPLOAD:
        return flow.parsed !== null && flow.parseError === null;
      case BulkImportStep.SELECT_HEADER_ROW:
        return headerRowDraft !== null;
      case BulkImportStep.MATCH_COLUMNS:
        return (
          activeMatchColumns.length > 0 &&
          activeMatchColumns.every(
            (col) => matchDraft.mapping[col.index] !== null,
          )
        );
      default:
        return false;
    }
  }, [
    flow.step,
    flow.parsed,
    flow.parseError,
    headerRowDraft,
    activeMatchColumns,
    matchDraft.mapping,
  ]);

  const handleConfirm = useCallback(() => {
    flowRef.current.applyEdits(dirtyCellsRef.current);
    onComplete(stepResultRef.current());
    onOpenChange(false);
  }, [onComplete, onOpenChange]);

  const handleFileSelected = useCallback((file: File) => {
    void flowRef.current.handleFile(file);
  }, []);

  const handleGoNext = useCallback(() => {
    if (
      flowRef.current.step === BulkImportStep.SELECT_HEADER_ROW &&
      headerRowDraft !== null
    ) {
      flowRef.current.goNext({ headerRowIndex: headerRowDraft });
    } else if (flowRef.current.step === BulkImportStep.MATCH_COLUMNS) {
      flowRef.current.goNext({
        sourceColumnMapping: matchDraft.mapping,
        excludedColumns: matchDraft.excluded,
      });
    } else {
      flowRef.current.goNext();
    }
  }, [headerRowDraft, matchDraft]);

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

  const handleMappingChange = useCallback(
    (sourceIndex: number, fieldKey: string | null) => {
      setMatchDraft((prev) => {
        const nextMapping = { ...prev.mapping };
        if (fieldKey) {
          for (const [idx, mappedKey] of Object.entries(nextMapping)) {
            if (mappedKey === fieldKey && Number(idx) !== sourceIndex) {
              nextMapping[Number(idx)] = null;
            }
          }
        }
        nextMapping[sourceIndex] = fieldKey;
        return { ...prev, mapping: nextMapping };
      });
    },
    [],
  );

  const handleToggleExcluded = useCallback((sourceIndex: number) => {
    setMatchDraft((prev) => {
      const excluded = prev.excluded.includes(sourceIndex)
        ? prev.excluded.filter((i) => i !== sourceIndex)
        : [...prev.excluded, sourceIndex];
      const mapping = { ...prev.mapping, [sourceIndex]: null };
      return { mapping, excluded };
    });
  }, []);

  const handleAutoMap = useCallback(() => {
    if (!flow.parsed || headerRowDraft === null) return;
    const columns = buildAllSourceColumns(flow.parsed.rows, headerRowDraft);
    const mapping = autoMatchSourceColumns(fields, columns);
    setMatchDraft({ mapping, excluded: [] });
  }, [flow.parsed, headerRowDraft, fields]);

  const dialogClass = useMemo(
    () => ["gsl-bulk-import", className].filter(Boolean).join(" "),
    [className],
  );

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
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent
          className={dialogClass}
          showCloseButton
          preventClose={hasUnsavedProgress}
          preventCloseTitle="Exit import flow"
          preventCloseDescription="Are you sure? Your current information will not be saved."
          onInteractOutside={preventOverlayClose}
          aria-describedby={undefined}
        >
          <ModalTitle className="gsl-bulk-import__header">
            <nav className="gsl-bulk-import__stepper" aria-label="Import steps">
              <ol className="gsl-bulk-import__stepper-list">
                {STEPS.map((stepItem, index) => {
                  const isActive = flow.step === stepItem.id;
                  const isComplete = flow.maxStep > stepItem.id;
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
            className={["gsl-bulk-import__body", bodyStepClass]
              .filter(Boolean)
              .join(" ")}
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
                headerRowIndex={headerRowDraft}
                onSelectHeaderRow={setHeaderRowDraft}
              />
            )}

            {flow.step === BulkImportStep.MATCH_COLUMNS && flow.parsed && (
              <MatchColumnsStep
                fields={fields}
                allSourceColumns={allSourceColumns}
                previewRows={previewRows}
                sourceColumnMapping={matchDraft.mapping}
                excludedColumns={matchDraft.excluded}
                onSourceMappingChange={handleMappingChange}
                onToggleExcludedColumn={handleToggleExcluded}
                onResetMapping={handleAutoMap}
              />
            )}

            {flow.step === BulkImportStep.VALIDATE_DATA && (
              <ValidateDataStep
                fields={fields}
                mappedRows={flow.editableRows}
                errors={flow.validationErrors}
                discardedRows={flow.discardedRows}
                dirtyCellsRef={dirtyCellsRef}
                stepResultRef={stepResultRef}
                onDiscardSelectedRows={flow.discardSelectedRows}
                onResetDiscardedRows={flow.resetDiscardedRows}
                onCanConfirmChange={setCanConfirm}
              />
            )}

            <div
              className={[
                "gsl-bulk-import__loading",
                flow.isProcessingLarge
                  ? "gsl-bulk-import__loading--visible"
                  : "",
              ].join(" ")}
            >
              <h3 className="gsl-bulk-import__step-title">Processing</h3>
              <p className="gsl-bulk-import__step-note">
                {flow.step === BulkImportStep.VALIDATE_DATA
                  ? "Validating your records..."
                  : "Parsing your data..."}
              </p>
              <div className="gsl-bulk-import__loading-center">
                <Suspense fallback={null}>
                  <Lottie
                    animationData={animationData}
                    loop
                    autoplay
                    className="gsl-bulk-import__lottie"
                  />
                </Suspense>
                <div className="gsl-bulk-import__loading-bar">
                  <ProgressBar value={flow.processingProgress} size="md" />
                </div>
                {flow.processingTotal > 0 && (
                  <p className="gsl-bulk-import__loading-counter">
                    {Math.round(
                      (flow.processingProgress / 100) * flow.processingTotal,
                    ).toLocaleString()}
                    {" / "}
                    {flow.processingTotal.toLocaleString()} {loadingVerb}
                  </p>
                )}
              </div>
            </div>
          </ModalBody>

          {(flow.step > BulkImportStep.UPLOAD ||
            flow.parsed !== null ||
            flow.uploadedFile !== null) && (
            <ModalFooter className="gsl-bulk-import__footer">
              {flow.step > BulkImportStep.UPLOAD && (
                <Button
                  variant="outline"
                  size="md"
                  className="gsl-bulk-import__footer-action"
                  disabled={flow.isProcessingLarge}
                  onClick={handleGoBack}
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                  Back
                </Button>
              )}
              {flow.step < BulkImportStep.VALIDATE_DATA ? (
                <Button
                  variant="primary"
                  size="md"
                  className="gsl-bulk-import__footer-action"
                  disabled={flow.isProcessingLarge || !canGoNext}
                  onClick={handleGoNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  className="gsl-bulk-import__footer-action"
                  disabled={flow.isProcessingLarge || !canConfirm}
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
  );
}
