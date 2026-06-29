import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BulkImportStep,
} from "../../../types/bulk-import-modal";
import type {
  BulkImportFlowDefaultState,
  BulkImportResult,
  BulkImportValidationError,
  SourceColumnMapping,
  UseBulkImportFlowOptions,
  UseBulkImportFlowReturn,
} from "../../../types/bulk-import-modal";
import {
  autoMatchSourceColumns,
  buildAllSourceColumns,
  buildSourceColumns,
  mapRowsToRecords,
} from "../utils/mapRowsToRecords";
import {
  BulkImportParseError,
  normalizeRows,
  filterEmptyRows,
  isCsv,
  parseCsvText,
} from "../utils/parseSpreadsheetFile";
import * as XLSX from "xlsx";
import { validateMappedRows } from "../utils/validateMappedRows";

const CHUNK_SIZE = 1000;
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

const YIELD = () => new Promise<void>((r) => setTimeout(r, 0));

async function processInChunks<T, R>(
  items: T[],
  fn: (batch: T[]) => R[],
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<R[]> {
  const result: R[] = [];
  const total = items.length;
  for (let i = 0; i < total; i += CHUNK_SIZE) {
    if (signal?.aborted) return result;
    const batch = items.slice(i, i + CHUNK_SIZE);
    result.push(...fn(batch));
    onProgress(Math.round((Math.min(i + CHUNK_SIZE, total) / total) * 100));
    if (i + CHUNK_SIZE < total) await YIELD();
  }
  return result;
}

interface FlowState {
  step: BulkImportStep;
  parsed: UseBulkImportFlowReturn["parsed"];
  parseError: string | null;
  headerRowIndex: number | null;
  sourceColumnMapping: SourceColumnMapping;
  excludedColumns: number[];
  selectedRowIds: number[];
  showOnlyErrors: boolean;
  discardedRows: number[];
  editableRows: Record<string, string>[];
  isParsing: boolean;
  uploadedFile: File | null;
}

const SEED: FlowState = {
  step: BulkImportStep.UPLOAD,
  parsed: null,
  parseError: null,
  headerRowIndex: null,
  sourceColumnMapping: {},
  excludedColumns: [],
  selectedRowIds: [],
  showOnlyErrors: false,
  discardedRows: [],
  editableRows: [],
  isParsing: false,
  uploadedFile: null,
};

export function useBulkImportFlow(
  options: UseBulkImportFlowOptions,
): UseBulkImportFlowReturn {
  const { fields, maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE, open, defaultState } = options;

  const seed = useMemo(
    () => ({ ...SEED, ...defaultState }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [flow, setFlow] = useState<FlowState>(seed);
  const [isProcessingLarge, setIsProcessingLarge] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const abortRef = useRef(new AbortController());
  const [validationCache, setValidationCache] = useState<BulkImportValidationError[]>([]);

  const reset = useCallback(() => {
    setFlow(seed);
    setIsProcessingLarge(false);
    setProcessingProgress(0);
    setValidationCache([]);
  }, [seed]);

  useEffect(() => {
    if (!open) {
      abortRef.current.abort();
      abortRef.current = new AbortController();
      reset();
    }
  }, [open, reset]);

  const {
    step, parsed, parseError, headerRowIndex, sourceColumnMapping,
    excludedColumns, selectedRowIds, showOnlyErrors, discardedRows, editableRows,
    uploadedFile,
  } = flow;

  const sourceColumns = useMemo(() => {
    if (!parsed || headerRowIndex === null) return [];
    return buildSourceColumns(parsed.rows, headerRowIndex);
  }, [parsed, headerRowIndex]);

  const activeSourceColumns = useMemo(
    () => sourceColumns.filter((col) => !excludedColumns.includes(col.index)),
    [sourceColumns, excludedColumns],
  );

  const mappedRows = useMemo(() => {
    if (!parsed || headerRowIndex === null) return [];
    return mapRowsToRecords(parsed.rows, headerRowIndex, sourceColumnMapping, excludedColumns);
  }, [parsed, headerRowIndex, sourceColumnMapping, excludedColumns]);

  useEffect(() => {
    setValidationCache([]);
  }, [headerRowIndex, sourceColumnMapping]);

  const validationErrors = useMemo(
    () => validationCache.filter((e) => e.severity === "error"),
    [validationCache],
  );
  const validationWarnings = useMemo(
    () => validationCache.filter((e) => e.severity === "warning"),
    [validationCache],
  );

  const canGoNext = useMemo(() => {
    switch (step) {
      case BulkImportStep.UPLOAD:
        return parsed !== null && parseError === null;
      case BulkImportStep.SELECT_HEADER_ROW:
        return headerRowIndex !== null;
      case BulkImportStep.MATCH_COLUMNS:
        return (
          activeSourceColumns.length > 0 &&
          activeSourceColumns.every((col) => sourceColumnMapping[col.index] !== null)
        );
      default:
        return false;
    }
  }, [step, parsed, parseError, headerRowIndex, activeSourceColumns, sourceColumnMapping]);

  const resultRows = step === BulkImportStep.VALIDATE_DATA ? editableRows : mappedRows;

  const activeRows = resultRows.filter(
    (_, index) => !discardedRows.includes(index + 1),
  );

  const activeErrors = validationErrors.filter(
    (e) => !discardedRows.includes(e.row),
  );

  const activeWarnings = validationWarnings.filter(
    (e) => !discardedRows.includes(e.row),
  );

  const canImport = activeErrors.length === 0;

  function finishProcessing(rows: string[][], fileName: string) {
    const h = 0;
    const mapping = autoMatchSourceColumns(fields, buildAllSourceColumns(rows, h));
    const mapped = mapRowsToRecords(rows, h, mapping, []);
    setFlow((prev) => ({
      ...SEED,
      uploadedFile: prev.uploadedFile,
      step: BulkImportStep.SELECT_HEADER_ROW,
      parsed: { rows, fileName },
      headerRowIndex: h,
      sourceColumnMapping: mapping,
      editableRows: mapped,
    }));
  }

  const handleFile = useCallback(
    async (file: File) => {
      const signal = abortRef.current.signal;
      setFlow((prev) => ({ ...prev, uploadedFile: file, parseError: null }));

      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (![".xlsx", ".xls", ".csv"].includes(ext)) {
        setFlow((prev) => ({ ...prev, parseError: "Unsupported file type. Upload a .xlsx, .xls, or .csv file." }));
        return;
      }
      if (file.size > maxFileSizeBytes) {
        setFlow((prev) => ({ ...prev, parseError: `File is too large. Maximum size is ${Math.round(maxFileSizeBytes / (1024 * 1024))} MB.` }));
        return;
      }

      try {
        if (isCsv(file.name)) {
          setIsProcessingLarge(true);
          setProcessingProgress(0);
          await YIELD();

          const text = await file.text();
          if (signal.aborted) return;

          const lines = text.split("\n");
          let rows: string[][];

          if (lines.length <= CHUNK_SIZE) {
            rows = filterEmptyRows(normalizeRows(parseCsvText(text)));
          } else {
            rows = await processInChunks(
              lines,
              (batch) => filterEmptyRows(normalizeRows(parseCsvText(batch.join("\n")))),
              (pct) => setProcessingProgress(pct),
              signal,
            );
          }
          if (signal.aborted) return;

          setProcessingProgress(100);
          await new Promise((r) => setTimeout(r, 300));
          if (signal.aborted) return;

          finishProcessing(rows, file.name);
          setIsProcessingLarge(false);
          return;
        }

        const buffer = await file.arrayBuffer();
        if (signal.aborted) return;

        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          setFlow((prev) => ({ ...prev, parseError: "The uploaded file has no worksheets." }));
          return;
        }

        const sheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });
        if (signal.aborted) return;

        if (rawRows.length > CHUNK_SIZE) {
          setIsProcessingLarge(true);
          setProcessingProgress(0);
          await YIELD();

          const rows = await processInChunks(
            rawRows,
            (batch) => filterEmptyRows(normalizeRows(batch)),
            (pct) => setProcessingProgress(pct),
            signal,
          );
          if (signal.aborted) return;

          setProcessingProgress(100);
          await new Promise((r) => setTimeout(r, 300));
          if (signal.aborted) return;

          finishProcessing(rows, file.name);
          setIsProcessingLarge(false);
          return;
        }

        finishProcessing(filterEmptyRows(normalizeRows(rawRows)), file.name);
      } catch (error) {
        if (signal.aborted) return;
        setFlow((prev) => ({ ...prev, parsed: null, parseError: error instanceof BulkImportParseError ? error.message : "Failed to parse the uploaded file." }));
      } finally {
        setIsProcessingLarge(false);
      }
    },
    [maxFileSizeBytes, fields],
  );

  const removeFile = useCallback(() => {
    setFlow(SEED);
    setValidationCache([]);
  }, []);

  const goNext = useCallback(() => {
    setFlow((prev) => {
      if (
        prev.step === BulkImportStep.MATCH_COLUMNS &&
        prev.parsed &&
        prev.headerRowIndex !== null
      ) {
        const remapped = mapRowsToRecords(
          prev.parsed.rows,
          prev.headerRowIndex,
          prev.sourceColumnMapping,
          prev.excludedColumns,
        );
        return { ...prev, step: BulkImportStep.VALIDATE_DATA, editableRows: remapped };
      }
      return { ...prev, step: Math.min(BulkImportStep.VALIDATE_DATA, prev.step + 1) };
    });
  }, []);

  const goBack = useCallback(() => {
    setFlow((prev) => ({ ...prev, step: Math.max(BulkImportStep.UPLOAD, prev.step - 1) }));
  }, []);

  const goToStep = useCallback((target: BulkImportStep) => {
    setFlow((prev) => (target < prev.step ? { ...prev, step: target } : prev));
  }, []);

  const updateSourceMapping = useCallback(
    (sourceIndex: number, fieldKey: string | null) => {
      setFlow((prev) => {
        const next = { ...prev.sourceColumnMapping };
        if (fieldKey) {
          for (const [index, mappedFieldKey] of Object.entries(next)) {
            if (mappedFieldKey === fieldKey && Number(index) !== sourceIndex) {
              next[Number(index)] = null;
            }
          }
        }
        next[sourceIndex] = fieldKey;
        return { ...prev, sourceColumnMapping: next };
      });
    },
    [],
  );

  const autoMapColumns = useCallback(() => {
    if (!parsed || headerRowIndex === null) return;
    const mapping = autoMatchSourceColumns(fields, buildAllSourceColumns(parsed.rows, headerRowIndex));
    setFlow((prev) => ({ ...prev, sourceColumnMapping: mapping, excludedColumns: [] }));
  }, [fields, headerRowIndex, parsed]);

  const toggleExcludedColumn = useCallback((sourceIndex: number) => {
    setFlow((prev) => {
      const excluded = prev.excludedColumns.includes(sourceIndex)
        ? prev.excludedColumns.filter((i) => i !== sourceIndex)
        : [...prev.excludedColumns, sourceIndex];
      return { ...prev, excludedColumns: excluded, sourceColumnMapping: { ...prev.sourceColumnMapping, [sourceIndex]: null } };
    });
  }, []);

  const toggleRowSelection = useCallback((rowId: number) => {
    setFlow((prev) => ({
      ...prev,
      selectedRowIds: prev.selectedRowIds.includes(rowId)
        ? prev.selectedRowIds.filter((id) => id !== rowId)
        : [...prev.selectedRowIds, rowId],
    }));
  }, []);

  const setVisibleRowsSelection = useCallback((rowIds: number[], selected: boolean) => {
    setFlow((prev) => ({
      ...prev,
      selectedRowIds: selected
        ? [...new Set([...prev.selectedRowIds, ...rowIds])]
        : prev.selectedRowIds.filter((id) => !rowIds.includes(id)),
    }));
  }, []);

  const discardSelectedRows = useCallback(() => {
    setFlow((prev) => ({
      ...prev,
      discardedRows: [...new Set([...prev.discardedRows, ...prev.selectedRowIds])],
      selectedRowIds: [],
    }));
  }, []);

  const resetDiscardedRows = useCallback(() => {
    setFlow((prev) => ({ ...prev, discardedRows: [] }));
  }, []);

  const updateRowValue = useCallback(
    (rowId: number, fieldKey: string, value: string) => {
      setFlow((prev) => {
        const next = prev.editableRows.map((row, i) =>
          i + 1 === rowId ? { ...row, [fieldKey]: value } : row,
        );
        const changedRow = next[rowId - 1];
        if (!changedRow) return prev;

        const rowIssues = validateMappedRows(next, fields, rowId);
        const allIssues = [...rowIssues];

        const editedField = fields.find((f) => f.key === fieldKey);
        if (editedField?.unique) {
          const valueMap = new Map<string, number[]>();
          next.forEach((r, i) => {
            const v = (r[fieldKey] ?? "").trim();
            if (!v) return;
            if (!valueMap.has(v)) valueMap.set(v, []);
            valueMap.get(v)!.push(i + 1);
          });

          for (const [, indices] of valueMap) {
            if (indices.length > 1) {
              for (const idx of indices) {
                allIssues.push({
                  row: idx,
                  fieldKey,
                  fieldLabel: editedField.label,
                  message: `Duplicate ${editedField.label}: ${next[idx - 1][fieldKey] ?? ""}`,
                  severity: "error" as const,
                });
              }
            }
          }
        }

        setValidationCache((prevCache) => [
          ...prevCache.filter((issue) =>
            issue.row !== rowId &&
            !(issue.fieldKey === fieldKey && issue.message.startsWith("Duplicate")),
          ),
          ...allIssues,
        ]);

        return { ...prev, editableRows: next };
      });
    },
    [fields],
  );

  useEffect(() => {
    if (step !== BulkImportStep.VALIDATE_DATA) return;
    if (validationCache.length > 0) return;

    const signal = abortRef.current.signal;
    const uniqueFields = fields.filter((f) => f.unique);
    const nonUniqueFields = fields.filter((f) => !f.unique);

    setIsProcessingLarge(true);
    setProcessingProgress(0);

    (async () => {
      const fieldIssues = nonUniqueFields.length > 0
        ? await processInChunks(
            editableRows,
            (batch) => validateMappedRows(batch, nonUniqueFields),
            (pct) => setProcessingProgress(pct),
            signal,
          )
        : [];
      if (signal.aborted) return;

      const uniqueIssues = uniqueFields.length > 0
        ? validateMappedRows(editableRows, uniqueFields)
        : [];

      setValidationCache([...fieldIssues, ...uniqueIssues]);
      setIsProcessingLarge(false);
    })();
  }, [step, validationCache.length, editableRows, fields]);

  const buildResultRef = useRef<UseBulkImportFlowReturn["buildResult"]>(() => ({ rows: [], errors: [], warnings: [] }));
  buildResultRef.current = () => ({ rows: activeRows, errors: activeErrors, warnings: activeWarnings });
  const buildResult = useCallback((): BulkImportResult => buildResultRef.current(), []);

  return {
    step,
    parsed,
    parseError,
    headerRowIndex,
    sourceColumnMapping,
    excludedColumns,
    sourceColumns: activeSourceColumns,
    mappedRows,
    editableRows,
    validationErrors,
    validationWarnings,
    selectedRowIds,
    showOnlyErrors,
    discardedRows,
    canGoNext,
    canImport,
    isParsing: flow.isParsing,
    isProcessingLarge,
    processingProgress,
    uploadedFile,
    setHeaderRowIndex: useCallback((v) => setFlow((prev) => ({ ...prev, headerRowIndex: v })), []),
    setSourceColumnMapping: useCallback((v) => setFlow((prev) => ({ ...prev, sourceColumnMapping: v })), []),
    updateSourceMapping,
    toggleExcludedColumn,
    setSelectedRowIds: useCallback((v) => setFlow((prev) => ({ ...prev, selectedRowIds: v })), []),
    toggleRowSelection,
    setVisibleRowsSelection,
    setShowOnlyErrors: useCallback((v) => setFlow((prev) => ({ ...prev, showOnlyErrors: v })), []),
    discardSelectedRows,
    resetDiscardedRows,
    updateRowValue,
    handleFile,
    autoMapColumns,
    goNext,
    goBack,
    goToStep,
    reset,
    buildResult,
    removeFile,
  };
}
