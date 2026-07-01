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
import { validateRowsChunked } from "../utils/validateRowsChunked";

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
  maxStep: BulkImportStep;
  parsed: UseBulkImportFlowReturn["parsed"];
  parseError: string | null;
  headerRowIndex: number | null;
  sourceColumnMapping: SourceColumnMapping;
  excludedColumns: number[];
  discardedRows: number[];
  editableRows: Record<string, string>[];
  isParsing: boolean;
  uploadedFile: File | null;
}

const SEED: FlowState = {
  step: BulkImportStep.UPLOAD,
  maxStep: BulkImportStep.UPLOAD,
  parsed: null,
  parseError: null,
  headerRowIndex: null,
  sourceColumnMapping: {},
  excludedColumns: [],
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
  const [processingTotal, setProcessingTotal] = useState(0);

  const abortRef = useRef(new AbortController());
  const syncedMappingRef = useRef<string | null>(null);
  const [validationCache, setValidationCache] = useState<BulkImportValidationError[]>([]);

  const reset = useCallback(() => {
    setFlow(seed);
    setIsProcessingLarge(false);
    setProcessingProgress(0);
    setProcessingTotal(0);
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
    excludedColumns, discardedRows, editableRows,
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
    if (step === BulkImportStep.VALIDATE_DATA) return [];
    return mapRowsToRecords(parsed.rows, headerRowIndex, sourceColumnMapping, excludedColumns);
  }, [parsed, headerRowIndex, sourceColumnMapping, excludedColumns, step]);

  useEffect(() => {
    setValidationCache([]);
  }, [headerRowIndex, sourceColumnMapping]);

  useEffect(() => {
    if (step !== BulkImportStep.VALIDATE_DATA) {
      syncedMappingRef.current = null;
      return;
    }
    if (!parsed || headerRowIndex === null) return;

    const mappingId = JSON.stringify([sourceColumnMapping, excludedColumns]);
    if (syncedMappingRef.current === mappingId) return;

    const timer = setTimeout(async () => {
      const dataRows = parsed.rows.slice(headerRowIndex + 1);
      const excluded = new Set(excludedColumns);
      const remapped: Record<string, string>[] = [];

      for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
        const batch = dataRows.slice(i, i + CHUNK_SIZE);
        for (const row of batch) {
          const record: Record<string, string> = {};
          for (const [sourceIndexValue, fieldKey] of Object.entries(
            sourceColumnMapping,
          )) {
            const sourceIndex = Number(sourceIndexValue);
            if (!fieldKey || excluded.has(sourceIndex)) continue;
            record[fieldKey] = (row[sourceIndex] ?? "").trim();
          }
          if (Object.values(record).some((v) => v.length > 0)) {
            remapped.push(record);
          }
        }
        if (i + CHUNK_SIZE < dataRows.length) await YIELD();
      }

      syncedMappingRef.current = mappingId;
      setFlow((prev) => ({
        ...prev,
        editableRows: remapped,
      }));
    }, 0);

    return () => clearTimeout(timer);
  }, [step, parsed, headerRowIndex, sourceColumnMapping, excludedColumns]);

  const validationErrors = useMemo(
    () => validationCache.filter((e) => e.severity === "error"),
    [validationCache],
  );
  const validationWarnings = useMemo(
    () => validationCache.filter((e) => e.severity === "warning"),
    [validationCache],
  );

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
      maxStep: BulkImportStep.SELECT_HEADER_ROW,
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
          setProcessingTotal(lines.length);
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

  const goNext = useCallback((draft?: { headerRowIndex?: number | null; sourceColumnMapping?: SourceColumnMapping; excludedColumns?: number[] }) => {
    if (step === BulkImportStep.MATCH_COLUMNS) {
      setIsProcessingLarge(true);
      setProcessingProgress(0);
    }
    setFlow((prev) => {
      const next = { ...prev, ...draft };
      const targetStep = Math.min(BulkImportStep.VALIDATE_DATA, prev.step + 1) as BulkImportStep;
      next.step = targetStep;
      next.maxStep = Math.max(prev.maxStep, targetStep) as BulkImportStep;
      return next;
    });
  }, [step, setIsProcessingLarge, setProcessingProgress]);

  const goBack = useCallback(() => {
    setFlow((prev) => ({ ...prev, step: Math.max(BulkImportStep.UPLOAD, prev.step - 1) }));
  }, []);

  const goToStep = useCallback((target: BulkImportStep) => {
    if (target === BulkImportStep.VALIDATE_DATA) {
      setIsProcessingLarge(true);
      setProcessingProgress(0);
    }
    setFlow((prev) => (target <= prev.maxStep ? { ...prev, step: target } : prev));
  }, [setIsProcessingLarge, setProcessingProgress]);

  const discardSelectedRows = useCallback((ids: number[]) => {
    setFlow((prev) => ({
      ...prev,
      discardedRows: [...new Set([...prev.discardedRows, ...ids])],
    }));
  }, []);

  const resetDiscardedRows = useCallback(() => {
    setFlow((prev) => ({ ...prev, discardedRows: [] }));
  }, []);

  const applyEdits = useCallback((dirtyCells: Record<string, string>) => {
    const entries = Object.entries(dirtyCells);
    if (entries.length === 0) return;

    setFlow((prev) => {
      const next = prev.editableRows.map((row) => ({ ...row }));
      for (const [cellKey, value] of entries) {
        const colonIdx = cellKey.indexOf(":");
        const rowId = Number(cellKey.slice(0, colonIdx));
        const fieldKey = cellKey.slice(colonIdx + 1);
        const row = next[rowId - 1];
        if (row) row[fieldKey] = value;
      }
      return { ...prev, editableRows: next };
    });
  }, []);

  useEffect(() => {
    if (step !== BulkImportStep.VALIDATE_DATA) {
      abortRef.current.abort();
      abortRef.current = new AbortController();
      setIsProcessingLarge(false);
      return;
    }
    if (validationCache.length > 0) return;

    const mappingId = JSON.stringify([sourceColumnMapping, excludedColumns]);
    if (syncedMappingRef.current !== mappingId) return;

    setIsProcessingLarge(true);
    setProcessingProgress(0);
    setProcessingTotal(editableRows.length);

    const signal = abortRef.current.signal;
    (async () => {
      const issues = await validateRowsChunked({
        rows: editableRows,
        fields,
        signal,
        onProgress: setProcessingProgress,
      });
      if (signal.aborted) return;

      setValidationCache(issues);
      setIsProcessingLarge(false);
    })();
  }, [step, validationCache.length, editableRows, fields, sourceColumnMapping, excludedColumns]);

  const buildResultRef = useRef<UseBulkImportFlowReturn["buildResult"]>(() => ({ rows: [], errors: [], warnings: [] }));
  buildResultRef.current = () => ({ rows: activeRows, errors: activeErrors, warnings: activeWarnings });
  const buildResult = useCallback((): BulkImportResult => buildResultRef.current(), []);

  return {
    step,
    maxStep: flow.maxStep,
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
    discardedRows,
    canImport,
    isParsing: flow.isParsing,
    isProcessingLarge,
    processingProgress,
    processingTotal,
    uploadedFile,
    discardSelectedRows,
    resetDiscardedRows,
    applyEdits,
    handleFile,
    goNext,
    goBack,
    goToStep,
    reset,
    buildResult,
    removeFile,
  };
}
