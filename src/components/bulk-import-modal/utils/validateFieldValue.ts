import type { BulkImportField } from "../../../types/bulk-import-modal";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_PATTERN = /^[+]?[\d\s().-]{7,}$/;
const BOOLEAN_VALUES = new Set(["true", "false", "yes", "no", "1", "0"]);

function normalizeValue(value: string, field: BulkImportField) {
  const shouldTrim = field.trim !== false;
  return shouldTrim ? value.trim() : value;
}

function validateType(value: string, field: BulkImportField): string | null {
  const type = field.type ?? "string";
  if (type === "string") {
    return null;
  }

  switch (type) {
    case "email":
      return EMAIL_PATTERN.test(value) ? null : "Must be a valid email address";
    case "number":
      if (value.length === 0 || Number.isNaN(Number(value))) {
        return "Must be a valid number";
      }
      return null;
    case "integer":
      if (value.length === 0 || !/^-?\d+$/.test(value)) {
        return "Must be a valid integer";
      }
      return null;
    case "date":
      if (!DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
        return "Must be a valid date (YYYY-MM-DD)";
      }
      return null;
    case "boolean":
      return BOOLEAN_VALUES.has(value.toLowerCase())
        ? null
        : "Must be true/false, yes/no, or 1/0";
    case "url":
      try {
        new URL(value);
        return null;
      } catch {
        return "Must be a valid URL";
      }
    case "phone":
      return PHONE_PATTERN.test(value) ? null : "Must be a valid phone number";
    default:
      return null;
  }
}

function validateLength(value: string, field: BulkImportField): string | null {
  if (field.minLength !== undefined && value.length < field.minLength) {
    return `Must be at least ${field.minLength} characters`;
  }

  if (field.maxLength !== undefined && value.length > field.maxLength) {
    return `Must be at most ${field.maxLength} characters`;
  }

  return null;
}

function validateNumericRange(value: string, field: BulkImportField): string | null {
  if (field.min === undefined && field.max === undefined) {
    return null;
  }

  if (field.type !== "number" && field.type !== "integer") {
    return null;
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return null;
  }

  if (field.min !== undefined && numericValue < field.min) {
    return `Must be at least ${field.min}`;
  }

  if (field.max !== undefined && numericValue > field.max) {
    return `Must be at most ${field.max}`;
  }

  return null;
}

function validatePattern(value: string, field: BulkImportField): string | null {
  if (!field.pattern) {
    return null;
  }

  const regex =
    field.pattern instanceof RegExp
      ? field.pattern
      : new RegExp(field.pattern);

  return regex.test(value)
    ? null
    : field.patternMessage ?? "Value does not match the required pattern";
}

function validateOptions(value: string, field: BulkImportField): string | null {
  if (!field.options || field.options.length === 0) {
    return null;
  }

  const matches = field.optionsIgnoreCase
    ? field.options.some((option) => option.toLowerCase() === value.toLowerCase())
    : field.options.includes(value);

  return matches
    ? null
    : field.optionsMessage ??
        `Must be one of: ${field.options.join(", ")}`;
}

export function validateFieldValue(
  field: BulkImportField,
  rawValue: string,
): string | null {
  const value = normalizeValue(rawValue, field);

  if (field.required && value.length === 0) {
    return "Required field is empty";
  }

  if (value.length === 0) {
    return null;
  }

  return (
    validateType(value, field) ??
    validateLength(value, field) ??
    validateNumericRange(value, field) ??
    validatePattern(value, field) ??
    validateOptions(value, field) ??
    field.validate?.(value) ??
    null
  );
}

export function getFieldHint(field: BulkImportField): string | null {
  if (field.description) {
    return field.example
      ? `${field.description} Example: ${field.example}`
      : field.description;
  }

  const hints: string[] = [];

  if (field.type && field.type !== "string") {
    hints.push(`Type: ${field.type}`);
  }

  if (field.pattern) {
    const patternText =
      field.pattern instanceof RegExp
        ? field.pattern.source
        : field.pattern;
    hints.push(`Pattern: ${patternText}`);
  }

  if (field.minLength !== undefined || field.maxLength !== undefined) {
    if (
      field.minLength !== undefined &&
      field.maxLength !== undefined
    ) {
      hints.push(`Length: ${field.minLength}-${field.maxLength}`);
    } else if (field.minLength !== undefined) {
      hints.push(`Min length: ${field.minLength}`);
    } else {
      hints.push(`Max length: ${field.maxLength}`);
    }
  }

  if (field.min !== undefined || field.max !== undefined) {
    if (field.min !== undefined && field.max !== undefined) {
      hints.push(`Range: ${field.min}-${field.max}`);
    } else if (field.min !== undefined) {
      hints.push(`Min: ${field.min}`);
    } else {
      hints.push(`Max: ${field.max}`);
    }
  }

  if (field.options?.length) {
    hints.push(`Allowed: ${field.options.join(", ")}`);
  }

  if (field.example) {
    hints.push(`Example: ${field.example}`);
  }

  return hints.length > 0 ? hints.join(" · ") : null;
}
