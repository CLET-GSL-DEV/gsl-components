import { describe, expect, it } from "vitest";
import writeXlsxFile from "write-excel-file/browser";
import {
  BulkImportParseError,
  LEGACY_XLS_MESSAGE,
  isAcceptedSpreadsheetFile,
  parseCsvText,
  parseSpreadsheetFile,
} from "./parseSpreadsheetFile";

describe("isAcceptedSpreadsheetFile", () => {
  it("accepts .xlsx and .csv", () => {
    expect(isAcceptedSpreadsheetFile("students.csv")).toBe(true);
    expect(isAcceptedSpreadsheetFile("students.xlsx")).toBe(true);
  });

  it("rejects legacy .xls and anything else", () => {
    expect(isAcceptedSpreadsheetFile("students.xls")).toBe(false);
    expect(isAcceptedSpreadsheetFile("students.pdf")).toBe(false);
  });
});

describe("parseCsvText", () => {
  it("parses single-column files without a delimiter", () => {
    expect(parseCsvText("Email\na@example.com\n")).toEqual([
      ["Email"],
      ["a@example.com"],
    ]);
  });

  it("handles quoted commas, escaped quotes, and multiline fields", () => {
    expect(
      parseCsvText(
        'Name,Note\n"Doe, Jane","She said ""hi"""\n"Multi","line one\nline two"\n',
      ),
    ).toEqual([
      ["Name", "Note"],
      ["Doe, Jane", 'She said "hi"'],
      ["Multi", "line one\nline two"],
    ]);
  });
});

describe("parseSpreadsheetFile", () => {
  it("parses csv content into rows", async () => {
    const csv = "Email,Full name\na@example.com,Ada Lovelace\n";
    const file = new File([csv], "students.csv", { type: "text/csv" });

    await expect(parseSpreadsheetFile(file)).resolves.toEqual({
      fileName: "students.csv",
      rows: [
        ["Email", "Full name"],
        ["a@example.com", "Ada Lovelace"],
      ],
    });
  });

  it("parses an .xlsx file into rows", async () => {
    const blob = await writeXlsxFile([
      ["Email", "Full name"],
      ["a@example.com", "Ada Lovelace"],
    ]).toBlob();
    const file = new File([blob], "students.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    await expect(parseSpreadsheetFile(file)).resolves.toEqual({
      fileName: "students.xlsx",
      rows: [
        ["Email", "Full name"],
        ["a@example.com", "Ada Lovelace"],
      ],
    });
  });

  it("rejects legacy .xls with a re-save hint", async () => {
    const file = new File(["..."], "students.xls", {
      type: "application/vnd.ms-excel",
    });

    await expect(parseSpreadsheetFile(file)).rejects.toThrow(
      new BulkImportParseError(LEGACY_XLS_MESSAGE),
    );
  });

  it("rejects unsupported file types", async () => {
    const file = new File(["{}"], "students.json", { type: "application/json" });

    await expect(parseSpreadsheetFile(file)).rejects.toThrow(BulkImportParseError);
  });

  it("rejects empty files", async () => {
    const file = new File(["\n\n"], "students.csv", { type: "text/csv" });

    await expect(parseSpreadsheetFile(file)).rejects.toThrow(
      new BulkImportParseError("The uploaded file is empty."),
    );
  });
});
