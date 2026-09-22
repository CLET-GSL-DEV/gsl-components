// Spreadsheet parsing peers, picked by the consuming app:
// - papaparse for .csv (no runtime dependencies, RFC 4180 compliant)
// - read-excel-file for .xlsx (browser entry point, actively published)
import Papa from "papaparse";
import { readSheet } from "read-excel-file/browser";
import type { ParsedSpreadsheet } from "../../../types/bulk-import-modal";
import { ACCEPTED_EXTENSIONS } from "../constants";

export class BulkImportParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BulkImportParseError";
  }
}

export const UNSUPPORTED_FILE_TYPE_MESSAGE =
  "Unsupported file type. Upload a .xlsx or .csv file.";

export const LEGACY_XLS_MESSAGE =
  "Legacy .xls files are not supported. Re-save the file as .xlsx and upload it again.";

function getExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase();
}

function isCsvFile(fileName: string) {
  return getExtension(fileName) === ".csv";
}

function isLegacyXlsFile(fileName: string) {
  return getExtension(fileName) === ".xls";
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  return String(value).trim();
}

export function normalizeRows(rows: unknown[][]): string[][] {
  return rows.map((row) =>
    row.map((cell) => normalizeCellValue(cell)),
  );
}

export function filterEmptyRows(rows: string[][]): string[][] {
  return rows.filter((row) =>
    row.some((cell) => cell.length > 0),
  );
}

export function isAcceptedSpreadsheetFile(fileName: string) {
  return ACCEPTED_EXTENSIONS.includes(getExtension(fileName) as typeof ACCEPTED_EXTENSIONS[number]);
}

export function isCsv(fileName: string) {
  return isCsvFile(fileName);
}

export function parseCsvText(text: string): string[][] {
  if (text.trim().length === 0) {
    return [];
  }

  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: true,
  });

  // "UndetectableDelimiter" is Papa guessing "," on delimiter-free input
  // (single-column files, blank files). It is not a parse failure.
  const fatal = result.errors.filter(
    (error) => error.code !== "UndetectableDelimiter",
  );

  if (fatal.length > 0) {
    throw new BulkImportParseError(fatal[0].message);
  }

  return result.data;
}

function isLegacyXlsError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  const name = (error as { name?: unknown }).name;
  const message = error instanceof Error ? error.message : "";

  return (
    code === "XLS_FILE_NOT_SUPPORTED" ||
    name === "XLS_FILE_NOT_SUPPORTED" ||
    message.includes("XLS_FILE_NOT_SUPPORTED")
  );
}

export async function parseSpreadsheetFile(
  file: File,
  maxFileSizeBytes = 5 * 1024 * 1024,
): Promise<ParsedSpreadsheet> {
  if (isLegacyXlsFile(file.name)) {
    throw new BulkImportParseError(LEGACY_XLS_MESSAGE);
  }

  if (!isAcceptedSpreadsheetFile(file.name)) {
    throw new BulkImportParseError(UNSUPPORTED_FILE_TYPE_MESSAGE);
  }

  if (file.size > maxFileSizeBytes) {
    throw new BulkImportParseError(
      `File is too large. Maximum size is ${Math.round(maxFileSizeBytes / (1024 * 1024))} MB.`,
    );
  }

  if (isCsvFile(file.name)) {
    const text = await file.text();
    const rows = filterEmptyRows(normalizeRows(parseCsvText(text)));

    if (rows.length === 0) {
      throw new BulkImportParseError("The uploaded file is empty.");
    }

    return {
      rows,
      fileName: file.name,
    };
  }

  let rawRows: unknown[][];
  try {
    rawRows = await readSheet(file);
  } catch (error) {
    if (error instanceof BulkImportParseError) {
      throw error;
    }

    if (isLegacyXlsError(error)) {
      throw new BulkImportParseError(LEGACY_XLS_MESSAGE);
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      throw new BulkImportParseError(UNSUPPORTED_FILE_TYPE_MESSAGE);
    }

    throw new BulkImportParseError(
      "Failed to parse the uploaded file. Make sure it is a valid .xlsx file.",
    );
  }

  if (rawRows.length === 0) {
    throw new BulkImportParseError("The uploaded file is empty.");
  }

  const rows = filterEmptyRows(normalizeRows(rawRows));

  if (rows.length === 0) {
    throw new BulkImportParseError("The uploaded file is empty.");
  }

  return {
    rows,
    fileName: file.name,
  };
}
