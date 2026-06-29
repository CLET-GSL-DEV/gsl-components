import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectHeaderRowStep } from "./SelectHeaderRowStep";

function buildRows(count: number): string[][] {
  return Array.from({ length: count }, (_, rowIndex) => [
    `Col A ${rowIndex}`,
    `Col B ${rowIndex}`,
  ]);
}

describe("SelectHeaderRowStep", () => {
  it("shows first 20 rows and selects a row when clicking outside the radio", async () => {
    const user = userEvent.setup();
    const onSelectHeaderRow = vi.fn();
    const rows = buildRows(25);

    render(
      <SelectHeaderRowStep
        rows={rows}
        headerRowIndex={null}
        onSelectHeaderRow={onSelectHeaderRow}
      />,
    );

    expect(screen.getByText("Col A 19")).toBeInTheDocument();
    expect(screen.queryByText("Col A 20")).not.toBeInTheDocument();

    await user.click(screen.getByText("Col B 19"));

    expect(onSelectHeaderRow).toHaveBeenCalledWith(19);
  });
});
