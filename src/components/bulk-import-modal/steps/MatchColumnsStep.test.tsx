import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MatchColumnsStep } from "./MatchColumnsStep";

const fields = [
  { key: "email", label: "Email", required: true },
  { key: "full_name", label: "Full name", required: true },
  { key: "year", label: "Year" },
];

const allSourceColumns = [
  { index: 0, label: "name" },
  { index: 1, label: "title" },
  { index: 2, label: "dob" },
];

const previewRows = [
  ["Ada", "Budget", "2024-01-01"],
  ["Grace", "Report", "2024-02-01"],
];

describe("MatchColumnsStep", () => {
  it("renders stacked sections with aligned source columns and dropdowns", () => {
    render(
      <MatchColumnsStep
        fields={fields}
        allSourceColumns={allSourceColumns}
        previewRows={previewRows}
        sourceColumnMapping={{ 0: "email" }}
        excludedColumns={[]}
        onSourceMappingChange={vi.fn()}
        onToggleExcludedColumn={vi.fn()}
        onResetMapping={vi.fn()}
      />,
    );

    expect(document.querySelector(".clet-bulk-import__match-board")).toBeInTheDocument();

    const yourTable = screen.getByText("Your table");
    const willBecome = screen.getByText("Will become");

    expect(
      yourTable.compareDocumentPosition(willBecome) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("dob")).toBeInTheDocument();

    const dropdowns = screen.getAllByRole("combobox");
    expect(dropdowns).toHaveLength(3);
  });

  it("opens a custom listbox when a mapping trigger is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MatchColumnsStep
        fields={fields}
        allSourceColumns={allSourceColumns}
        previewRows={previewRows}
        sourceColumnMapping={{}}
        excludedColumns={[]}
        onSourceMappingChange={vi.fn()}
        onToggleExcludedColumn={vi.fn()}
        onResetMapping={vi.fn()}
      />,
    );

    await user.click(screen.getAllByRole("combobox")[0]!);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Email" })).toBeInTheDocument();
  });
});
