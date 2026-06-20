import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BulkImportFlowDefaultState,
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

function getDefaultState(
  ds?: BulkImportFlowDefaultState,
): Required<BulkImportFlowDefaultState> {
  return {
    step: ds?.step ?? 1,
    parsed: ds?.parsed ?? null,
    headerRowIndex: ds?.headerRowIndex ?? null,
    sourceColumnMapping: ds?.sourceColumnMapping ?? {},
    excludedColumns: ds?.excludedColumns ?? [],
    selectedRowIds: ds?.selectedRowIds ?? [],
    showOnlyErrors: ds?.showOnlyErrors ?? false,
    discardedRows: ds?.discardedRows ?? [],
    editableRows: ds?.editableRows ?? [],
  };
}

export function useBulkImportFlow(
  options: UseBulkImportFlowOptions,
): UseBulkImportFlowReturn {
  const { fields, maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE, open, defaultState } = options;

  const defaultsRef = useRef(getDefaultState(defaultState));

  // Update defaults when defaultState changes so reset() always uses the latest
  useEffect(() => {
    defaultsRef.current = getDefaultState(defaultState);
  }, [defaultState]);

  const [step, setStep] = useState<BulkImportStep>(defaultsRef.current.step);
  const [parsed, setParsed] = useState<UseBulkImportFlowReturn["parsed"]>(defaultsRef.current.parsed);
  const [parseError, setParseError] = useState<string | null>(null);
  const [headerRowIndex, setHeaderRowIndex] = useState<number | null>(defaultsRef.current.headerRowIndex);
  const [sourceColumnMapping, setSourceColumnMapping] =
    useState<SourceColumnMapping>(defaultsRef.current.sourceColumnMapping);
  const [excludedColumns, setExcludedColumns] = useState<number[]>(defaultsRef.current.excludedColumns);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>(defaultsRef.current.selectedRowIds);
  const [showOnlyErrors, setShowOnlyErrors] = useState(defaultsRef.current.showOnlyErrors);
  const [discardedRows, setDiscardedRows] = useState<number[]>(defaultsRef.current.discardedRows);
  const [editableRows, setEditableRows] = useState<Record<string, string>[]>(defaultsRef.current.editableRows);
  const [isParsing, setIsParsing] = useState(false);

  const reset = useCallback(() => {
    const d = defaultsRef.current;
    setStep(d.step);
    setParsed(d.parsed);
    setParseError(null);
    setHeaderRowIndex(d.headerRowIndex);
    setSourceColumnMapping(d.sourceColumnMapping);
    setExcludedColumns(d.excludedColumns);
    setSelectedRowIds(d.selectedRowIds);
    setShowOnlyErrors(d.showOnlyErrors);
    setDiscardedRows(d.discardedRows);
    setEditableRows(d.editableRows);
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

  const shouldValidate = step === 4;
  const rowsForValidation = step === 4 ? editableRows : mappedRows;

  const validationIssues = useMemo(
    () => (shouldValidate ? validateMappedRows(rowsForValidation, fields) : []),
    [shouldValidate, rowsForValidation, fields],
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

  const resultRows = step === 4 ? editableRows : mappedRows;

  const activeRows = useMemo(
    () =>
      resultRows.filter((_, index) => !discardedRows.includes(index + 1)),
    [resultRows, discardedRows],
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
        setEditableRows([]);
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

  const setVisibleRowsSelection = useCallback(
    (rowIds: number[], selected: boolean) => {
      setSelectedRowIds((current) => {
        if (selected) {
          return [...new Set([...current, ...rowIds])];
        }

        return current.filter((id) => !rowIds.includes(id));
      });
    },
    [],
  );

  const discardSelectedRows = useCallback(() => {
    setDiscardedRows((current) => [
      ...new Set([...current, ...selectedRowIds]),
    ]);
    setSelectedRowIds([]);
  }, [selectedRowIds]);

  const updateRowValue = useCallback(
    (rowId: number, fieldKey: string, value: string) => {
      setEditableRows((current) =>
        current.map((row, index) =>
          index + 1 === rowId ? { ...row, [fieldKey]: value } : row,
        ),
      );
    },
    [],
  );

  const goNext = useCallback(() => {
    setStep((current) => {
      if (current === 2 && headerRowIndex !== null && parsed) {
        const hasMapping = Object.values(sourceColumnMapping).some(
          (v) => v !== null,
        );
        if (!hasMapping) {
          const columns = buildAllSourceColumns(parsed.rows, headerRowIndex);
          setSourceColumnMapping(autoMatchSourceColumns(fields, columns));
          setExcludedColumns([]);
        }
      }

      if (current === 3 && headerRowIndex !== null && parsed) {
        const rows = mapRowsToRecords(
          parsed.rows,
          headerRowIndex,
          sourceColumnMapping,
          excludedColumns,
        );
        setEditableRows(rows.map((row) => ({ ...row })));
      }

      return Math.min(4, current + 1) as BulkImportStep;
    });
  }, [
    excludedColumns,
    fields,
    headerRowIndex,
    parsed,
    sourceColumnMapping,
  ]);

  const goBack = useCallback(() => {
    setStep((current) => Math.max(1, current - 1) as BulkImportStep);
  }, []);

  const goToStep = useCallback((target: BulkImportStep) => {
    setStep((current) => {
      // Only allow going to completed steps or current step
      if (target < current) return target;
      return current;
    });
  }, []);

  const buildResult = useCallback((): BulkImportResult => {
    return {
      rows: activeRows,
      errors: activeErrors,
      warnings: activeWarnings,
    };
  }, [activeRows, activeErrors, activeWarnings]);

  return useMemo(
    () => ({
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
      isParsing,
      setHeaderRowIndex,
      setSourceColumnMapping,
      updateSourceMapping,
      toggleExcludedColumn,
      setSelectedRowIds,
      toggleRowSelection,
      setVisibleRowsSelection,
      setShowOnlyErrors,
      discardSelectedRows,
      updateRowValue,
      handleFile,
      goNext,
      goBack,
      goToStep,
      reset,
      buildResult,
    }),
    [
      step,
      parsed,
      parseError,
      headerRowIndex,
      sourceColumnMapping,
      excludedColumns,
      activeSourceColumns,
      mappedRows,
      editableRows,
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
      setVisibleRowsSelection,
      setShowOnlyErrors,
      discardSelectedRows,
      updateRowValue,
      handleFile,
      goNext,
      goBack,
      goToStep,
      reset,
      buildResult,
    ],
  );
}
