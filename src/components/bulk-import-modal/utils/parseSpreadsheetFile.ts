import * as XLSX from "xlsx";
import type { ParsedSpreadsheet } from "../../../types/bulk-import-modal";

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export class BulkImportParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BulkImportParseError";
  }
}

function getExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase();
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeRows(rows: unknown[][]): string[][] {
  return rows.map((row) =>
    row.map((cell) => normalizeCellValue(cell)),
  );
}

export function isAcceptedSpreadsheetFile(fileName: string) {
  return ACCEPTED_EXTENSIONS.includes(getExtension(fileName));
}

export async function parseSpreadsheetFile(
  file: File,
  maxFileSizeBytes = 5 * 1024 * 1024,
): Promise<ParsedSpreadsheet> {
  if (!isAcceptedSpreadsheetFile(file.name)) {
    throw new BulkImportParseError(
      "Unsupported file type. Upload a .xlsx, .xls, or .csv file.",
    );
  }

  if (file.size > maxFileSizeBytes) {
    throw new BulkImportParseError(
      `File is too large. Maximum size is ${Math.round(maxFileSizeBytes / (1024 * 1024))} MB.`,
    );
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new BulkImportParseError("The uploaded file has no worksheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  const rows = normalizeRows(rawRows).filter((row) =>
    row.some((cell) => cell.length > 0),
  );

  if (rows.length === 0) {
    throw new BulkImportParseError("The uploaded file is empty.");
  }

  return {
    rows,
    fileName: file.name,
  };
}
