import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBulkImportFlow } from "./useBulkImportFlow";
import { BulkImportStep } from "../../../types/bulk-import-modal";

const fields = [
  { key: "email", label: "Email", required: true, type: "email" as const },
  { key: "full_name", label: "Full name", required: true },
];

describe("useBulkImportFlow", () => {
  it("advances through steps when prerequisites are met", async () => {
    const { result } = renderHook(() =>
      useBulkImportFlow({
        fields,
        open: true,
      }),
    );

    const csv = "Email,Full name\na@example.com,Ada Lovelace\n";
    const file = new File([csv], "students.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.handleFile(file);
    });

    expect(result.current.parsed?.rows).toHaveLength(2);
    expect(result.current.step).toBe(BulkImportStep.SELECT_HEADER_ROW);
    expect(result.current.headerRowIndex).toBe(0);

    act(() => {
      result.current.goNext();
    });

    expect(result.current.step).toBe(BulkImportStep.MATCH_COLUMNS);
    expect(result.current.sourceColumnMapping).toEqual({
      0: "email",
      1: "full_name",
    });

    act(() => {
      result.current.goNext();
    });

    expect(result.current.step).toBe(BulkImportStep.VALIDATE_DATA);
    expect(result.current.mappedRows).toHaveLength(0);
    expect(result.current.editableRows).toHaveLength(1);
    expect(result.current.editableRows[0]?.email).toBe("a@example.com");
  });

  it("commits a header row draft via goNext", async () => {
    const { result } = renderHook(() =>
      useBulkImportFlow({ fields, open: true }),
    );

    const csv = "Email,Full name\na@example.com,Ada Lovelace\n";
    const file = new File([csv], "students.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.handleFile(file);
    });

    act(() => {
      result.current.goNext({ headerRowIndex: 1 });
    });

    expect(result.current.step).toBe(BulkImportStep.MATCH_COLUMNS);
    expect(result.current.headerRowIndex).toBe(1);
  });

  it("commits mapping and excluded columns draft via goNext", async () => {
    const { result } = renderHook(() =>
      useBulkImportFlow({ fields, open: true }),
    );

    const csv = "Full name,Email,Notes\nAda Lovelace,a@example.com,extra\n";
    const file = new File([csv], "students.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.handleFile(file);
    });

    act(() => {
      result.current.goNext({ headerRowIndex: 0 });
    });

    act(() => {
      result.current.goNext({
        sourceColumnMapping: { 0: "full_name", 1: null, 2: null },
        excludedColumns: [2],
      });
    });

    expect(result.current.step).toBe(BulkImportStep.VALIDATE_DATA);
    expect(result.current.sourceColumnMapping[0]).toBe("full_name");
    expect(result.current.excludedColumns).toEqual([2]);
  });

  it("applies dirty cells to editableRows without re-validating", async () => {
    const { result } = renderHook(() =>
      useBulkImportFlow({ fields, open: true }),
    );

    const csv =
      "Email,Full name\na@example.com,Ada Lovelace\nbad,Grace Hopper\n";
    const file = new File([csv], "students.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.handleFile(file);
    });
    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goNext();
    });

    expect(result.current.step).toBe(BulkImportStep.VALIDATE_DATA);

    act(() => {
      result.current.applyEdits({ "2:email": "grace@example.com" });
    });

    expect(result.current.editableRows[1]?.email).toBe("grace@example.com");
  });

  it("applies multiple dirty cells in a single pass", async () => {
    const { result } = renderHook(() =>
      useBulkImportFlow({ fields, open: true }),
    );

    const csv = "Email,Full name\na@example.com,Ada\n\n";
    const file = new File([csv], "students.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.handleFile(file);
    });
    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goNext();
    });

    act(() => {
      result.current.applyEdits({
        "1:email": "fixed@example.com",
        "1:full_name": "Fixed Name",
      });
    });

    expect(result.current.editableRows[0]?.email).toBe("fixed@example.com");
    expect(result.current.editableRows[0]?.full_name).toBe("Fixed Name");
  });

  it("discards rows by id and excludes them from the built result", async () => {
    const { result } = renderHook(() =>
      useBulkImportFlow({
        fields: [
          { key: "email", label: "Email", required: true },
          { key: "full_name", label: "Full name", required: true },
        ],
        open: true,
      }),
    );

    const csv =
      "Email,Full name\na@example.com,Ada Lovelace\nbad,Grace Hopper\n";
    const file = new File([csv], "students.csv", { type: "text/csv" });

    await act(async () => {
      await result.current.handleFile(file);
    });
    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goNext();
    });

    expect(result.current.editableRows).toHaveLength(2);

    act(() => {
      result.current.discardSelectedRows([2]);
    });

    const built = result.current.buildResult();
    expect(built.rows).toHaveLength(1);
    expect(built.rows[0]?.email).toBe("a@example.com");
  });

  it("stays on step 1 when file parsing fails", async () => {
    const { result } = renderHook(() =>
      useBulkImportFlow({
        fields,
        open: true,
      }),
    );

    const file = new File(["not,a,valid,extension"], "students.txt", {
      type: "text/plain",
    });

    await act(async () => {
      await result.current.handleFile(file);
    });

    expect(result.current.step).toBe(BulkImportStep.UPLOAD);
    expect(result.current.parsed).toBeNull();
    expect(result.current.parseError).not.toBeNull();
  });

  it("resets when the modal closes", async () => {
    const { result, rerender } = renderHook(
      ({ open }) => useBulkImportFlow({ fields, open }),
      { initialProps: { open: true } },
    );

    const file = new File(["Email\na@example.com\n"], "students.csv", {
      type: "text/csv",
    });

    await act(async () => {
      await result.current.handleFile(file);
    });

    rerender({ open: false });

    expect(result.current.step).toBe(BulkImportStep.UPLOAD);
    expect(result.current.parsed).toBeNull();
  });
});
