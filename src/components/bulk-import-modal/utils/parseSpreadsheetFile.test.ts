import { describe, expect, it } from "vitest";
import {
  BulkImportParseError,
  isAcceptedSpreadsheetFile,
  parseSpreadsheetFile,
} from "./parseSpreadsheetFile";

describe("isAcceptedSpreadsheetFile", () => {
  it("accepts spreadsheet extensions", () => {
    expect(isAcceptedSpreadsheetFile("students.csv")).toBe(true);
    expect(isAcceptedSpreadsheetFile("students.xlsx")).toBe(true);
    expect(isAcceptedSpreadsheetFile("students.xls")).toBe(true);
    expect(isAcceptedSpreadsheetFile("students.pdf")).toBe(false);
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
