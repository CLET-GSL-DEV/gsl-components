import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ValidateDataStep } from "./ValidateDataStep";

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

const defaultProps = {
  fields,
  mappedFieldKeys: ["email", "full_name"],
  mappedRows,
  errors,
  selectedRowIds: [],
  showOnlyErrors: false,
  discardedRows: [],
  onToggleRowSelection: vi.fn(),
  onSetVisibleRowsSelection: vi.fn(),
  onShowOnlyErrorsChange: vi.fn(),
  onDiscardSelectedRows: vi.fn(),
  onUpdateRowValue: vi.fn(),
};

/** Find the <tr> containing a given textbox input */
function findRowForInput(labelRegex: RegExp): HTMLTableRowElement {
  const input = screen.getByRole("textbox", { name: labelRegex });
  return input.closest("tr")!;
}

/** Find the checkbox inside a given table row */
function findRowCheckbox(row: HTMLTableRowElement): HTMLButtonElement {
  const cb = row.querySelector('button[role="checkbox"]') as HTMLButtonElement;
  return cb;
}

describe("ValidateDataStep", () => {
  it("renders mapped rows and toolbar controls", () => {
    render(<ValidateDataStep {...defaultProps} />);

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
      document.querySelector(".gsl-bulk-import__table-wrap--validate"),
    ).toBeInTheDocument();
  });

  it("filters to rows with errors when showOnlyErrors is enabled", () => {
    render(<ValidateDataStep {...defaultProps} showOnlyErrors />);

    expect(screen.getByDisplayValue("bad")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("a@example.com")).not.toBeInTheDocument();
  });

  it("shows an empty message when the error filter yields no rows", () => {
    render(
      <ValidateDataStep
        {...defaultProps}
        mappedRows={[{ email: "a@example.com", full_name: "Ada Lovelace" }]}
        errors={[]}
        showOnlyErrors
      />,
    );

    expect(screen.getByText("No rows with errors.")).toBeInTheDocument();
  });

  it("renders cells as text inputs", () => {
    render(<ValidateDataStep {...defaultProps} />);

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(4);
    inputs.forEach((input) => {
      expect(input).toHaveClass("gsl-bulk-import__cell-input");
    });
  });

  it("calls onUpdateRowValue when typing in a cell", () => {
    const onUpdateRowValue = vi.fn();

    render(
      <ValidateDataStep {...defaultProps} onUpdateRowValue={onUpdateRowValue} />,
    );

    const emailInput = screen.getByLabelText("Email, row 2");
    fireEvent.change(emailInput, { target: { value: "fixed@example.com" } });

    expect(onUpdateRowValue).toHaveBeenCalledWith(
      2,
      "email",
      "fixed@example.com",
    );
  });

  it("shows aria-invalid and error tooltip on invalid fields", () => {
    render(<ValidateDataStep {...defaultProps} />);

    const emailInput = screen.getByLabelText("Email, row 2");
    const errorCell = emailInput.closest(".gsl-bulk-import__cell--error");

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveClass("gsl-bulk-import__cell-input--error");
    expect(errorCell).not.toBeNull();
    expect(
      errorCell?.querySelector(".gsl-bulk-import__cell-error-tooltip"),
    ).toHaveTextContent("Must be a valid email");
  });

  it("indicates selected rows via checked checkboxes", () => {
    render(<ValidateDataStep {...defaultProps} selectedRowIds={[2]} />);

    const row = findRowForInput(/Email, row 2/i);
    const cb = findRowCheckbox(row);

    expect(cb).toHaveAttribute("aria-checked", "true");
  });

  it("selects all visible rows from the header checkbox", () => {
    const onSetVisibleRowsSelection = vi.fn();

    render(
      <ValidateDataStep
        {...defaultProps}
        onSetVisibleRowsSelection={onSetVisibleRowsSelection}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));

    expect(onSetVisibleRowsSelection).toHaveBeenCalledWith([1, 2], true);
  });

  it("deselects visible rows when the header checkbox is cleared", () => {
    const onSetVisibleRowsSelection = vi.fn();

    render(
      <ValidateDataStep
        {...defaultProps}
        selectedRowIds={[1, 2]}
        onSetVisibleRowsSelection={onSetVisibleRowsSelection}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));

    expect(onSetVisibleRowsSelection).toHaveBeenCalledWith([1, 2], false);
  });

  it("selects only visible rows when the error filter is enabled", () => {
    const onSetVisibleRowsSelection = vi.fn();

    render(
      <ValidateDataStep
        {...defaultProps}
        showOnlyErrors
        onSetVisibleRowsSelection={onSetVisibleRowsSelection}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));

    expect(onSetVisibleRowsSelection).toHaveBeenCalledWith([2], true);
  });
});
