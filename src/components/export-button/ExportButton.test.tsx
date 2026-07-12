import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExportButton } from "./ExportButton";
import * as exportUtils from "../../utils/export";

const rows = [
  { id: 1, name: "Ama Serwaa" },
  { id: 2, name: "Kojo Mensah" },
];

const columns = [
  { header: "Name", accessor: (row: (typeof rows)[number]) => row.name },
];

describe("ExportButton", () => {
  it("renders as a button with the export label", () => {
    render(<ExportButton data={rows} columns={columns} title="Staff" />);

    expect(screen.getByRole("button", { name: /Export/ })).toBeInTheDocument();
  });

  it("opens a menu with CSV, Excel, and PDF options", async () => {
    const user = userEvent.setup();
    render(<ExportButton data={rows} columns={columns} title="Staff" />);

    await user.click(screen.getByRole("button", { name: /Export/ }));

    expect(screen.getByRole("button", { name: "Export as CSV" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export as Excel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export as PDF" })).toBeInTheDocument();
  });

  it("only renders the requested formats", async () => {
    const user = userEvent.setup();
    render(
      <ExportButton
        data={rows}
        columns={columns}
        title="Staff"
        formats={["csv"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Export/ }));

    expect(screen.getByRole("button", { name: "Export as CSV" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export as Excel" })).not.toBeInTheDocument();
  });

  it("calls exportToCsv with the data and columns when CSV is selected", async () => {
    const csvSpy = vi.spyOn(exportUtils, "exportToCsv").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ExportButton data={rows} columns={columns} title="Staff" />);

    await user.click(screen.getByRole("button", { name: /Export/ }));
    await user.click(screen.getByRole("button", { name: "Export as CSV" }));

    expect(csvSpy).toHaveBeenCalledTimes(1);
    expect(csvSpy).toHaveBeenCalledWith(
      rows,
      columns,
      expect.stringMatching(/^staff-\d{4}-\d{2}-\d{2}_\d{4}\.csv$/),
    );

    csvSpy.mockRestore();
  });

  it("calls exportToPdf with title and record count when PDF is selected", async () => {
    const pdfSpy = vi.spyOn(exportUtils, "exportToPdf").mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <ExportButton
        data={rows}
        columns={columns}
        title="Staff"
        filtersDescription="Active only"
      />,
    );

    await user.click(screen.getByRole("button", { name: /Export/ }));
    await user.click(screen.getByRole("button", { name: "Export as PDF" }));

    expect(pdfSpy).toHaveBeenCalledTimes(1);
    expect(pdfSpy).toHaveBeenCalledWith(
      rows,
      columns,
      expect.stringContaining(".pdf"),
      { title: "Staff", recordCount: 2, filters: "Active only" },
    );

    pdfSpy.mockRestore();
  });

  it("passes through button props like disabled and variant", () => {
    render(
      <ExportButton
        data={rows}
        columns={columns}
        title="Staff"
        disabled
        variant="ghost"
      />,
    );

    const button = screen.getByRole("button", { name: /Export/ });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("gsl-button--ghost");
  });
});
