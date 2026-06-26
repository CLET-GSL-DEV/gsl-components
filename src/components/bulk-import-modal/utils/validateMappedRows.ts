import type {
  BulkImportField,
  BulkImportValidationError,
} from "../../../types/bulk-import-modal";
import { validateFieldValue } from "./validateFieldValue";

/**
 * Validate mapped rows: per-cell checks + column-level duplicate detection.
 *
 * Duplicates are detected per unique field independently. Each unique field
 * maintains a `Map<value, firstRowNumber>` — when the same value appears in
 * a later row, that row gets flagged with "Duplicate {fieldLabel}: {value}".
 * Runs in a single pass — O(rows × fields).
 */
export function validateMappedRows(
  rows: Record<string, string>[],
  fields: BulkImportField[],
): BulkImportValidationError[] {
  const issues: BulkImportValidationError[] = [];
  const uniqueFields = fields.filter((f) => f.unique);

  // One Map per unique field — value → first row number
  const seen = new Map<string, Map<string, number>>();
  for (const field of uniqueFields) {
    seen.set(field.key, new Map());
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;

    for (const field of fields) {
      const value = row[field.key] ?? "";

      // 1. Per-cell validation (required, type, length, pattern, etc.)
      const message = validateFieldValue(field, value);
      if (message) {
        issues.push({
          row: rowNumber,
          fieldKey: field.key,
          fieldLabel: field.label,
          message,
          severity: "error",
        });
      }

      // 2. Column-level uniqueness check
      if (field.unique) {
        const fieldSeen = seen.get(field.key)!;
        if (!value) {
          // Skip empty values — required check already handles them
          continue;
        }
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

  return issues;
}

export function splitValidationIssues(issues: BulkImportValidationError[]) {
  return {
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
  };
}
