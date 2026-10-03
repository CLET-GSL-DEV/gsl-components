import { describe, expect, it } from "vitest";
import {
  autoMatchSourceColumns,
  buildSourceColumns,
  isRequiredMappingComplete,
  mapRowsToRecords,
} from "./mapRowsToRecords";
import type { BulkImportField } from "../../../types/bulk-import-modal";

const fields = [
  { key: "email", label: "Email", required: true },
  { key: "full_name", label: "Full name", required: true },
];

describe("buildSourceColumns", () => {
  it("returns non-empty header labels with indexes", () => {
    const rows = [
      ["Email", "Full name", ""],
      ["a@example.com", "Ada Lovelace", "ignored"],
    ];

    expect(buildSourceColumns(rows, 0)).toEqual([
      { index: 0, label: "Email" },
      { index: 1, label: "Full name" },
    ]);
  });
});

describe("mapRowsToRecords", () => {
  it("maps data rows using source-centric mapping", () => {
    const rows = [
      ["Email", "Full name"],
      ["a@example.com", "Ada Lovelace"],
      ["b@example.com", "Grace Hopper"],
    ];

    const records = mapRowsToRecords(
      rows,
      0,
      { 0: "email", 1: "full_name" },
      [],
    );

    expect(records).toEqual([
      { email: "a@example.com", full_name: "Ada Lovelace" },
      { email: "b@example.com", full_name: "Grace Hopper" },
    ]);
  });

  it("skips excluded source columns", () => {
    const rows = [
      ["Email", "Notes"],
      ["a@example.com", "ignore me"],
    ];

    const records = mapRowsToRecords(rows, 0, { 0: "email", 1: "full_name" }, [1]);

    expect(records).toEqual([{ email: "a@example.com" }]);
  });
});

describe("autoMatchSourceColumns", () => {
  it("matches source columns to fields by label", () => {
    expect(
      autoMatchSourceColumns(fields, [
        { index: 0, label: "email" },
        { index: 1, label: "Full name" },
      ]),
    ).toEqual({
      0: "email",
      1: "full_name",
    });
  });
});

describe("isRequiredMappingComplete", () => {
  it("requires all required fields to be mapped from active columns", () => {
    expect(
      isRequiredMappingComplete(fields, { 0: "email", 1: null }, []),
    ).toBe(false);
    expect(
      isRequiredMappingComplete(fields, { 0: "email", 1: "full_name" }, []),
    ).toBe(true);
    expect(
      isRequiredMappingComplete(fields, { 0: "email", 1: "full_name" }, [1]),
    ).toBe(false);
  });
});

describe("file fields", () => {
  const fields: BulkImportField[] = [
    { key: "email", label: "Email", required: true },
    { key: "photo", label: "Photo", type: "file", required: true },
  ];

  it("does not let a required file field block the mapping", () => {
    expect(isRequiredMappingComplete(fields, { 0: "email" }, [])).toBe(true);
  });

  it("never auto-matches a column to a file field", () => {
    const mapping = autoMatchSourceColumns(fields, [
      { index: 0, label: "Email" },
      { index: 1, label: "Photo" },
    ]);

    expect(mapping).toEqual({ 0: "email", 1: null });
  });
});
