import type {
  BulkImportField,
  BulkImportValidationError,
} from "../../../types/bulk-import-modal";
import { validateFieldValue } from "./validateFieldValue";

export function validateMappedRows(
  rows: Record<string, string>[],
  fields: BulkImportField[],
  changedRowIndex?: number,
  files?: Record<number, Record<string, File>>,
): BulkImportValidationError[] {
  const uniqueFields = fields.filter((f) => f.unique);

  if (changedRowIndex !== undefined && changedRowIndex > 0) {
    return [
      ...incrementalValidation(rows, fields, uniqueFields, changedRowIndex),
      ...validateRowFiles(changedRowIndex - 1, fields, files),
    ];
  }

  const issues = fullValidation(rows, fields, uniqueFields);
  for (let i = 0; i < rows.length; i++) {
    issues.push(...validateRowFiles(i, fields, files));
  }
  return issues;
}

/** Required file-type fields must have a file attached for the row. */
export function validateRowFiles(
  rowIndex: number,
  fields: BulkImportField[],
  files: Record<number, Record<string, File>> | undefined,
): BulkImportValidationError[] {
  const issues: BulkImportValidationError[] = [];

  for (const field of fields) {
    if (field.type !== "file" || !field.required) continue;
    if (files?.[rowIndex]?.[field.key]) continue;

    issues.push({
      row: rowIndex + 1,
      fieldKey: field.key,
      fieldLabel: field.label,
      message: "File is required",
      severity: "error",
    });
  }

  return issues;
}

function fullValidation(
  rows: Record<string, string>[],
  fields: BulkImportField[],
  uniqueFields: BulkImportField[],
): BulkImportValidationError[] {
  const issues: BulkImportValidationError[] = [];

  const seen = new Map<string, Map<string, number>>();
  for (const field of uniqueFields) {
    seen.set(field.key, new Map());
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;

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

      if (field.unique) {
        const fieldSeen = seen.get(field.key)!;
        if (!value) {
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

function incrementalValidation(
  rows: Record<string, string>[],
  fields: BulkImportField[],
  uniqueFields: BulkImportField[],
  changedRowIndex: number,
): BulkImportValidationError[] {
  const row = rows[changedRowIndex - 1];
  const issues: BulkImportValidationError[] = [];

  if (!row) return issues;

  for (const field of fields) {
    const value = row[field.key] ?? "";

    const message = validateFieldValue(field, value);
    if (message) {
      issues.push({
        row: changedRowIndex,
        fieldKey: field.key,
        fieldLabel: field.label,
        message,
        severity: "error",
      });
    }
  }

  for (const field of uniqueFields) {
    const value = row[field.key] ?? "";
    if (!value) continue;

    const duplicateRow = rows.findIndex(
      (otherRow, i) =>
        i !== changedRowIndex - 1 && (otherRow[field.key] ?? "") === value,
    );

    if (duplicateRow >= 0) {
      issues.push({
        row: changedRowIndex,
        fieldKey: field.key,
        fieldLabel: field.label,
        message: `Duplicate ${field.label}: ${value}`,
        severity: "error",
      });
    }
  }

  return issues;
}

export function validateBatch(
  rows: Record<string, string>[],
  fields: BulkImportField[],
  files?: Record<number, Record<string, File>>,
): BulkImportValidationError[] {
  return validateMappedRows(rows, fields, undefined, files);
}

export function splitValidationIssues(issues: BulkImportValidationError[]) {
  return {
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
  };
}
