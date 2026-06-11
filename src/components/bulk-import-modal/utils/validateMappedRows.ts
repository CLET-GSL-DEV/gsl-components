import type {
  BulkImportField,
  BulkImportValidationError,
} from "../../../types/bulk-import-modal";
import { validateFieldValue } from "./validateFieldValue";

export function validateMappedRows(
  rows: Record<string, string>[],
  fields: BulkImportField[],
): BulkImportValidationError[] {
  const issues: BulkImportValidationError[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 1;

    for (const field of fields) {
      const value = row[field.key] ?? "";
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
    }
  });

  return issues;
}

export function splitValidationIssues(issues: BulkImportValidationError[]) {
  return {
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
  };
}
