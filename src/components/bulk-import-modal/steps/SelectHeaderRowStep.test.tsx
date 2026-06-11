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
  it("renders all rows and selects a row when clicking outside the radio", async () => {
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

    expect(screen.getByText("Col A 24")).toBeInTheDocument();

    await user.click(screen.getByText("Col B 24"));

    expect(onSelectHeaderRow).toHaveBeenCalledWith(24);
  });
});
