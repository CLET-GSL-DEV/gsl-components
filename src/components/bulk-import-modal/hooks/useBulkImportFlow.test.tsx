import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBulkImportFlow } from "./useBulkImportFlow";

const fields = [
  { key: "email", label: "Email", required: true },
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
    expect(result.current.step).toBe(2);
    expect(result.current.headerRowIndex).toBe(0);

    act(() => {
      result.current.goNext();
    });

    expect(result.current.step).toBe(3);
    expect(result.current.sourceColumnMapping).toEqual({
      0: "email",
      1: "full_name",
    });

    act(() => {
      result.current.goNext();
    });

    expect(result.current.step).toBe(4);
    expect(result.current.mappedRows).toHaveLength(1);
  });

  it("excludes discarded rows from the built result", async () => {
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
    expect(result.current.headerRowIndex).toBe(0);
    act(() => {
      result.current.goNext();
    });
    act(() => {
      result.current.goNext();
    });

    expect(result.current.mappedRows).toHaveLength(2);

    act(() => {
      result.current.toggleRowSelection(2);
    });
    act(() => {
      result.current.discardSelectedRows();
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

    expect(result.current.step).toBe(1);
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

    expect(result.current.step).toBe(1);
    expect(result.current.parsed).toBeNull();
  });
});
