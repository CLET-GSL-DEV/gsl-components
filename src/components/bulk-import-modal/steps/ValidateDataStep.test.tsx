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
  onShowOnlyErrorsChange: vi.fn(),
  onDiscardSelectedRows: vi.fn(),
  onUpdateRowValue: vi.fn(),
};

describe("ValidateDataStep", () => {
  it("renders mapped rows and toolbar controls", () => {
    render(<ValidateDataStep {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Validate data" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard selected rows" })).toBeDisabled();
    expect(
      screen.getByRole("switch", { name: "Show only rows with errors" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("a@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("bad")).toBeInTheDocument();
    expect(document.querySelector(".gsl-bulk-import__validate-board")).toBeInTheDocument();
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
    const errorCell = emailInput.closest("td");

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveClass("gsl-bulk-import__cell-input--error");
    expect(errorCell).toHaveAttribute("title", "Must be a valid email");
    expect(
      errorCell?.querySelector(".gsl-bulk-import__cell-error-tooltip"),
    ).toHaveTextContent("Must be a valid email");
  });

  it("applies selected row class when row is in selectedRowIds", () => {
    render(<ValidateDataStep {...defaultProps} selectedRowIds={[2]} />);

    const row2Checkbox = screen.getByRole("checkbox", { name: "Select row 2" });
    const selectedRow = row2Checkbox.closest("tr");

    expect(selectedRow).toHaveClass("gsl-bulk-import__table-row--selected");
  });
});
