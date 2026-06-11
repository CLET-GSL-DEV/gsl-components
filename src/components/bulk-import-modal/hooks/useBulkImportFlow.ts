import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BulkImportResult,
  BulkImportStep,
  SourceColumnMapping,
  UseBulkImportFlowOptions,
  UseBulkImportFlowReturn,
} from "../../../types/bulk-import-modal";
import {
  autoMatchSourceColumns,
  buildAllSourceColumns,
  buildSourceColumns,
  isRequiredMappingComplete,
  mapRowsToRecords,
} from "../utils/mapRowsToRecords";
import {
  BulkImportParseError,
  parseSpreadsheetFile,
} from "../utils/parseSpreadsheetFile";
import {
  splitValidationIssues,
  validateMappedRows,
} from "../utils/validateMappedRows";

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

export function useBulkImportFlow(
  options: UseBulkImportFlowOptions,
): UseBulkImportFlowReturn {
  const { fields, maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE, open } = options;

  const [step, setStep] = useState<BulkImportStep>(1);
  const [parsed, setParsed] = useState<UseBulkImportFlowReturn["parsed"]>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [headerRowIndex, setHeaderRowIndex] = useState<number | null>(null);
  const [sourceColumnMapping, setSourceColumnMapping] =
    useState<SourceColumnMapping>({});
  const [excludedColumns, setExcludedColumns] = useState<number[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [discardedRows, setDiscardedRows] = useState<number[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const reset = useCallback(() => {
    setStep(1);
    setParsed(null);
    setParseError(null);
    setHeaderRowIndex(null);
    setSourceColumnMapping({});
    setExcludedColumns([]);
    setSelectedRowIds([]);
    setShowOnlyErrors(false);
    setDiscardedRows([]);
    setIsParsing(false);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const sourceColumns = useMemo(() => {
    if (!parsed || headerRowIndex === null) {
      return [];
    }

    return buildSourceColumns(parsed.rows, headerRowIndex);
  }, [parsed, headerRowIndex]);

  const activeSourceColumns = useMemo(
    () =>
      sourceColumns.filter(
        (column) => !excludedColumns.includes(column.index),
      ),
    [sourceColumns, excludedColumns],
  );

  const mappedRows = useMemo(() => {
    if (!parsed || headerRowIndex === null) {
      return [];
    }

    return mapRowsToRecords(
      parsed.rows,
      headerRowIndex,
      sourceColumnMapping,
      excludedColumns,
    );
  }, [parsed, headerRowIndex, sourceColumnMapping, excludedColumns]);

  const validationIssues = useMemo(
    () => validateMappedRows(mappedRows, fields),
    [mappedRows, fields],
  );

  const { errors: validationErrors, warnings: validationWarnings } = useMemo(
    () => splitValidationIssues(validationIssues),
    [validationIssues],
  );

  const canGoNext = useMemo(() => {
    switch (step) {
      case 1:
        return parsed !== null && parseError === null;
      case 2:
        return headerRowIndex !== null;
      case 3:
        return isRequiredMappingComplete(
          fields,
          sourceColumnMapping,
          excludedColumns,
        );
      default:
        return false;
    }
  }, [
    step,
    parsed,
    parseError,
    headerRowIndex,
    fields,
    sourceColumnMapping,
    excludedColumns,
  ]);

  const activeRows = useMemo(
    () =>
      mappedRows.filter((_, index) => !discardedRows.includes(index + 1)),
    [mappedRows, discardedRows],
  );

  const activeErrors = useMemo(
    () => validationErrors.filter((issue) => !discardedRows.includes(issue.row)),
    [validationErrors, discardedRows],
  );

  const activeWarnings = useMemo(
    () =>
      validationWarnings.filter((issue) => !discardedRows.includes(issue.row)),
    [validationWarnings, discardedRows],
  );

  const canImport = activeErrors.length === 0;

  const handleFile = useCallback(
    async (file: File) => {
      setIsParsing(true);
      setParseError(null);

      try {
        const result = await parseSpreadsheetFile(file, maxFileSizeBytes);
        setParsed(result);
        setStep(2);
        setHeaderRowIndex(0);
        setSourceColumnMapping({});
        setExcludedColumns([]);
        setSelectedRowIds([]);
        setDiscardedRows([]);
      } catch (error) {
        setParsed(null);
        setParseError(
          error instanceof BulkImportParseError
            ? error.message
            : "Failed to parse the uploaded file.",
        );
      } finally {
        setIsParsing(false);
      }
    },
    [maxFileSizeBytes],
  );

  const updateSourceMapping = useCallback(
    (sourceIndex: number, fieldKey: string | null) => {
      setSourceColumnMapping((current) => {
        const next = { ...current };

        if (fieldKey) {
          for (const [index, mappedFieldKey] of Object.entries(next)) {
            if (mappedFieldKey === fieldKey && Number(index) !== sourceIndex) {
              next[Number(index)] = null;
            }
          }
        }

        next[sourceIndex] = fieldKey;
        return next;
      });
    },
    [],
  );

  const toggleExcludedColumn = useCallback((sourceIndex: number) => {
    setExcludedColumns((current) =>
      current.includes(sourceIndex)
        ? current.filter((index) => index !== sourceIndex)
        : [...current, sourceIndex],
    );
    setSourceColumnMapping((current) => ({
      ...current,
      [sourceIndex]: null,
    }));
  }, []);

  const toggleRowSelection = useCallback((rowId: number) => {
    setSelectedRowIds((current) =>
      current.includes(rowId)
        ? current.filter((id) => id !== rowId)
        : [...current, rowId],
    );
  }, []);

  const discardSelectedRows = useCallback(() => {
    setDiscardedRows((current) => [
      ...new Set([...current, ...selectedRowIds]),
    ]);
    setSelectedRowIds([]);
  }, [selectedRowIds]);

  const goNext = useCallback(() => {
    setStep((current) => {
      if (current === 2 && headerRowIndex !== null && parsed) {
        const columns = buildAllSourceColumns(parsed.rows, headerRowIndex);
        setSourceColumnMapping(autoMatchSourceColumns(fields, columns));
        setExcludedColumns([]);
      }

      return Math.min(4, current + 1) as BulkImportStep;
    });
  }, [fields, headerRowIndex, parsed]);

  const goBack = useCallback(() => {
    setStep((current) => Math.max(1, current - 1) as BulkImportStep);
  }, []);

  const buildResult = useCallback((): BulkImportResult => {
    return {
      rows: activeRows,
      errors: activeErrors,
      warnings: activeWarnings,
    };
  }, [activeRows, activeErrors, activeWarnings]);

  return {
    step,
    parsed,
    parseError,
    headerRowIndex,
    sourceColumnMapping,
    excludedColumns,
    sourceColumns: activeSourceColumns,
    mappedRows,
    validationErrors,
    validationWarnings,
    selectedRowIds,
    showOnlyErrors,
    discardedRows,
    canGoNext,
    canImport,
    isParsing,
    setHeaderRowIndex,
    setSourceColumnMapping,
    updateSourceMapping,
    toggleExcludedColumn,
    setSelectedRowIds,
    toggleRowSelection,
    setShowOnlyErrors,
    discardSelectedRows,
    handleFile,
    goNext,
    goBack,
    reset,
    buildResult,
  };
}
