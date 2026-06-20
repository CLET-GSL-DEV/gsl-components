export type BulkImportFieldType =
  | "string"
  | "email"
  | "number"
  | "integer"
  | "date"
  | "boolean"
  | "url"
  | "phone";

export interface BulkImportField {
  key: string;
  label: string;
  required?: boolean;
  type?: BulkImportFieldType;
  pattern?: string | RegExp;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  optionsIgnoreCase?: boolean;
  optionsMessage?: string;
  description?: string;
  example?: string;
  trim?: boolean;
  /** Alternate strings for optimistic column matching (case-insensitive) */
  matchKeys?: string[];
  validate?: (value: string) => string | null;
}

export interface BulkImportValidationError {
  row: number;
  fieldKey: string;
  fieldLabel: string;
  message: string;
  severity: "error" | "warning";
}

export interface BulkImportResult {
  rows: Record<string, string>[];
  errors: BulkImportValidationError[];
  warnings: BulkImportValidationError[];
}

export interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: BulkImportField[];
  onComplete: (result: BulkImportResult) => void;
  title?: string;
  maxFileSizeBytes?: number;
  allowImportWithWarnings?: boolean;
  className?: string;
  /** Seed initial flow state for progress preservation across open/close cycles. */
  defaultState?: BulkImportFlowDefaultState;
}

export interface SourceColumn {
  index: number;
  label: string;
}

export interface ParsedSpreadsheet {
  rows: string[][];
  fileName: string;
}

export type BulkImportStep = 1 | 2 | 3 | 4;

/** Maps source column index to target field key */
export type SourceColumnMapping = Record<number, string | null>;

/** @deprecated Use SourceColumnMapping — kept for backwards compatibility */
export type ColumnMapping = Record<string, number | null>;

/** Preservable subset of flow state for seeding initial values. */
export interface BulkImportFlowDefaultState {
  step?: BulkImportStep;
  parsed?: ParsedSpreadsheet | null;
  headerRowIndex?: number | null;
  sourceColumnMapping?: SourceColumnMapping;
  excludedColumns?: number[];
  selectedRowIds?: number[];
  showOnlyErrors?: boolean;
  discardedRows?: number[];
  editableRows?: Record<string, string>[];
}

export interface UseBulkImportFlowOptions {
  fields: BulkImportField[];
  maxFileSizeBytes?: number;
  open: boolean;
  /** Seed initial flow state for progress preservation across open/close cycles. */
  defaultState?: BulkImportFlowDefaultState;
}

export interface UseBulkImportFlowReturn {
  step: BulkImportStep;
  parsed: ParsedSpreadsheet | null;
  parseError: string | null;
  headerRowIndex: number | null;
  sourceColumnMapping: SourceColumnMapping;
  excludedColumns: number[];
  sourceColumns: SourceColumn[];
  mappedRows: Record<string, string>[];
  editableRows: Record<string, string>[];
  validationErrors: BulkImportValidationError[];
  validationWarnings: BulkImportValidationError[];
  selectedRowIds: number[];
  showOnlyErrors: boolean;
  discardedRows: number[];
  canGoNext: boolean;
  canImport: boolean;
  isParsing: boolean;
  setHeaderRowIndex: (index: number) => void;
  setSourceColumnMapping: (mapping: SourceColumnMapping) => void;
  updateSourceMapping: (sourceIndex: number, fieldKey: string | null) => void;
  toggleExcludedColumn: (sourceIndex: number) => void;
  setSelectedRowIds: (rowIds: number[]) => void;
  toggleRowSelection: (rowId: number) => void;
  setVisibleRowsSelection: (rowIds: number[], selected: boolean) => void;
  setShowOnlyErrors: (value: boolean) => void;
  discardSelectedRows: () => void;
  updateRowValue: (rowId: number, fieldKey: string, value: string) => void;
  handleFile: (file: File) => Promise<void>;
  autoMapColumns: () => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: BulkImportStep) => void;
  reset: () => void;
  buildResult: () => BulkImportResult;
}
