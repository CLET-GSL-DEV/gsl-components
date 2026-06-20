import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BulkImportModal } from "./BulkImportModal";

const fields = [
  { key: "email", label: "Email", required: true, type: "email" as const },
  { key: "full_name", label: "Full name", required: true },
];

const CLOSE_BTN = { name: "Close modal" };

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

    const headerRadio = screen.getByRole("radio", { checked: true });
    expect(headerRadio).toBeInTheDocument();
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

  it("closes immediately on step 1 with no uploaded file", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <BulkImportModal
        open
        onOpenChange={onOpenChange}
        fields={fields}
        onComplete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", CLOSE_BTN));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("shows exit confirmation after a file is uploaded", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <BulkImportModal
        open
        onOpenChange={onOpenChange}
        fields={fields}
        onComplete={vi.fn()}
      />,
    );

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

    await user.click(screen.getByRole("button", CLOSE_BTN));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Exit import flow" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure? Your current information will not be saved.",
      ),
    ).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("dismisses exit confirmation when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <BulkImportModal
        open
        onOpenChange={onOpenChange}
        fields={fields}
        onComplete={vi.fn()}
      />,
    );

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

    await user.click(screen.getByRole("button", CLOSE_BTN));

    const confirmDialog = screen.getByRole("alertdialog");
    await user.click(
      within(confirmDialog).getByRole("button", { name: "Cancel" }),
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("closes the modal when Exit flow is confirmed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <BulkImportModal
        open
        onOpenChange={onOpenChange}
        fields={fields}
        onComplete={vi.fn()}
      />,
    );

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

    await user.click(screen.getByRole("button", CLOSE_BTN));
    await user.click(screen.getByRole("button", { name: "Discard" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
