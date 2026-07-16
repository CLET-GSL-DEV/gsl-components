import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ValidateDataStep } from "./ValidateDataStep";
import type { BulkImportResult } from "../../../types/bulk-import-modal";

const fields = [
  { key: "email", label: "Email", required: true, type: "email" as const },
  { key: "full_name", label: "Full name", required: true },
];

const mappedRows = [
  { email: "a@example.com", full_name: "Ada Lovelace" },
  { email: "bad", full_name: "Grace Hopper" },
];

const errors = [
  {
    row: 2,
    fieldKey: "email",
    fieldLabel: "Email",
    message: "Must be a valid email",
    severity: "error" as const,
  },
];

function makeRef() {
  return { current: {} as Record<string, string> };
}

function makeStepResultRef() {
  return {
    current: (() => ({ rows: [], errors: [], warnings: [] })) as () => BulkImportResult,
  };
}

const defaultProps = {
  fields,
  mappedRows,
  errors,
  discardedRows: [] as number[],
  stepResultRef: makeStepResultRef(),
  onDiscardSelectedRows: vi.fn(),
  onResetDiscardedRows: vi.fn(),
  onCanConfirmChange: vi.fn(),
};

function findRowForInput(labelRegex: RegExp): HTMLTableRowElement {
  const input = screen.getByRole("textbox", { name: labelRegex });
  return input.closest("tr")!;
}

function findRowCheckbox(row: HTMLTableRowElement): HTMLButtonElement {
  return row.querySelector('button[role="checkbox"]') as HTMLButtonElement;
}

describe("ValidateDataStep", () => {
  it("renders mapped rows and toolbar controls", () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Validate data" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Discard selected rows" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("switch", { name: "Show only rows with errors (1)" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("a@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("bad")).toBeInTheDocument();
    expect(
      document.querySelector(".clet-bulk-import__table-wrap--validate"),
    ).toBeInTheDocument();
  });

  it("filters to rows with errors when showOnlyErrors is toggled", () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("switch", { name: "Show only rows with errors (1)" }),
    );

    expect(screen.getByRole("textbox", { name: "Email, row 2" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Email, row 1" })).not.toBeInTheDocument();
  });

  it("shows an empty message when the error filter yields no rows", () => {
    const ref = makeRef();
    render(
      <ValidateDataStep
        dirtyCellsRef={ref}
        {...defaultProps}
        mappedRows={[{ email: "a@example.com", full_name: "Ada Lovelace" }]}
        errors={[]}
      />,
    );

    fireEvent.click(
      screen.getByRole("switch", { name: "Show only rows with errors" }),
    );

    expect(screen.getByText("No rows with errors.")).toBeInTheDocument();
  });

  it("renders cells as text inputs", () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(4);
    inputs.forEach((input) => {
      expect(input).toHaveClass("clet-bulk-import__cell-input");
    });
  });

  it("writes edited cell value to dirtyCellsRef after debounce", async () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    const emailInput = screen.getByLabelText("Email, row 2") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "fixed@example.com" } });

    expect(emailInput.value).toBe("fixed@example.com");

    await waitFor(
      () => {
        expect(ref.current["2:email"]).toBe("fixed@example.com");
      },
      { timeout: 1500 },
    );
  });

  it("shows aria-invalid and error tooltip on invalid fields", async () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    const emailInput = screen.getByLabelText("Email, row 2");
    const errorCell = emailInput.closest(".clet-bulk-import__cell--error");

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveClass("clet-bulk-import__cell-input--error");
    expect(errorCell).not.toBeNull();

    fireEvent.mouseEnter(emailInput);
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveTextContent("Must be a valid email");
    });
  });

  it("marks a row as selected when its checkbox is clicked", () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    const row = findRowForInput(/Email, row 2/i);
    const cb = findRowCheckbox(row);

    fireEvent.click(cb);

    expect(cb).toHaveAttribute("aria-checked", "true");
  });

  it("selects all visible rows from the header checkbox", () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));

    for (const label of [/Email, row 1/i, /Email, row 2/i]) {
      const row = findRowForInput(label);
      expect(findRowCheckbox(row)).toHaveAttribute("aria-checked", "true");
    }
  });

  it("selects all and deselects all via header checkbox", () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" });

    fireEvent.click(selectAll);
    for (const label of [/Email, row 1/i, /Email, row 2/i]) {
      const row = findRowForInput(label);
      expect(findRowCheckbox(row)).toHaveAttribute("aria-checked", "true");
    }

    fireEvent.click(selectAll);
    for (const label of [/Email, row 1/i, /Email, row 2/i]) {
      const row = findRowForInput(label);
      expect(findRowCheckbox(row)).toHaveAttribute("aria-checked", "false");
    }
  });

  it("deselects all when deselecting from an ALL state", () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));

    const row = findRowForInput(/Email, row 1/i);
    fireEvent.click(findRowCheckbox(row));

    expect(findRowCheckbox(findRowForInput(/Email, row 1/i))).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(findRowCheckbox(findRowForInput(/Email, row 2/i))).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("selects only visible rows when the error filter is enabled", () => {
    const ref = makeRef();
    render(<ValidateDataStep dirtyCellsRef={ref} {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("switch", { name: "Show only rows with errors (1)" }),
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));

    expect(
      findRowCheckbox(findRowForInput(/Email, row 2/i)),
    ).toHaveAttribute("aria-checked", "true");

    expect(screen.queryByLabelText("Email, row 1")).toBeNull();
  });

  it("discards selected rows via ids", () => {
    const onDiscardSelectedRows = vi.fn();
    const ref = makeRef();
    render(
      <ValidateDataStep
        dirtyCellsRef={ref}
        {...defaultProps}
        onDiscardSelectedRows={onDiscardSelectedRows}
      />,
    );

    const row = findRowForInput(/Email, row 2/i);
    fireEvent.click(findRowCheckbox(row));

    fireEvent.click(
      screen.getByRole("button", { name: "Discard selected rows (1)" }),
    );

    expect(onDiscardSelectedRows).toHaveBeenCalledWith([2]);
  });
});
