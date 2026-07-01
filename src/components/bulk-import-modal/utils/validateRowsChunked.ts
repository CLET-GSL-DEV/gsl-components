import type {
  BulkImportField,
  BulkImportValidationError,
} from "../../../types/bulk-import-modal";
import { validateFieldValue } from "./validateFieldValue";

const CHUNK_SIZE = 1000;
const YIELD = () => new Promise<void>((r) => setTimeout(r, 0));

export interface ValidateRowsChunkedOptions {
  rows: Record<string, string>[];
  fields: BulkImportField[];
  signal?: AbortSignal;
  onProgress?: (pct: number) => void;
  getRow?: (
    row: Record<string, string>,
    rowIndex: number,
  ) => Record<string, string>;
}

export async function validateRowsChunked(
  options: ValidateRowsChunkedOptions,
): Promise<BulkImportValidationError[]> {
  const { rows, fields, signal, onProgress, getRow } = options;
  const total = rows.length;
  const uniqueFields = fields.filter((f) => f.unique);

  const seen = new Map<string, Map<string, number>>();
  for (const field of uniqueFields) {
    seen.set(field.key, new Map());
  }

  const issues: BulkImportValidationError[] = [];
  for (let i = 0; i < total; i += CHUNK_SIZE) {
    if (signal?.aborted) return issues;
    const batch = rows.slice(i, i + CHUNK_SIZE);

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const rowNumber = i + j + 1;
      const effectiveRow = getRow ? getRow(row, i + j) : row;

      for (const field of fields) {
        const value = effectiveRow[field.key] ?? "";

        const msg = validateFieldValue(field, value);
        if (msg) {
          issues.push({
            row: rowNumber,
            fieldKey: field.key,
            fieldLabel: field.label,
            message: msg,
            severity: "error",
          });
        }

        if (field.unique) {
          if (!value) continue;
          const fieldSeen = seen.get(field.key)!;
          if (fieldSeen.has(value)) {
            issues.push({
              row: rowNumber,
              fieldKey: field.key,
              fieldLabel: field.label,
              message: `Duplicate ${field.label}: ${value}`,
              severity: "error",
            });
          } else {
            fieldSeen.set(value, rowNumber);
          }
        }
      }
    }

    if (onProgress) {
      onProgress(
        Math.round((Math.min(i + CHUNK_SIZE, total) / total) * 100),
      );
    }
    if (i + CHUNK_SIZE < total) await YIELD();
  }

  return issues;
}
