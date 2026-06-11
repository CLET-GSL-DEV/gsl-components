import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BulkImportModal } from "./BulkImportModal";

const fields = [
  { key: "email", label: "Email", required: true, type: "email" as const },
  { key: "full_name", label: "Full name", required: true },
];

describe("BulkImportModal", () => {
  it("walks through the import flow and completes with mapped rows", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <BulkImportModal
        open
        onOpenChange={onOpenChange}
        fields={fields}
        onComplete={onComplete}
        title="Import students"
      />,
    );

    expect(screen.getByRole("dialog", { name: "Import students" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upload Document" })).toBeInTheDocument();
    expect(screen.getByText("Data that we expect:")).toBeInTheDocument();

    const csv = "Email,Full name\na@example.com,Ada Lovelace\n";
    const file = new File([csv], "students.csv", { type: "text/csv" });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Select header row" }),
      ).toBeInTheDocument();
    });

    const headerRadio = document.querySelector(
      'input[type="radio"]',
    ) as HTMLInputElement;
    expect(headerRadio).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Your table")).toBeInTheDocument();
    expect(screen.getByText("Will become")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("heading", { name: "Validate data" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onComplete).toHaveBeenCalledWith({
      rows: [{ email: "a@example.com", full_name: "Ada Lovelace" }],
      errors: [],
      warnings: [],
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
