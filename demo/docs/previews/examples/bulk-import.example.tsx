import type { BulkImportField, BulkImportResult } from "@rfdtech/components";
import { BulkImportModal, useModalSearchParam } from "@rfdtech/components";
import { useCallback } from "react";

const fields: BulkImportField[] = [
  {
    key: "organisation_name",
    label: "Organisation Name",
    required: true,
    example: "GSL Corporation",
  },
  {
    key: "organisation_email",
    type: "email",
    label: "Organisation Email",
    required: true,
    unique: true,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    example: "info@gsl.edu.gh",
  },
  {
    key: "document_name",
    label: "Document Name",
    required: true,
    example: "2024 Annual Budget",
  },
  {
    key: "document_type",
    label: "Document Type",
    required: false,
    example: "Financial",
  },
  {
    key: "date_submitted",
    label: "Date Submitted",
    required: false,
    example: "2024-01-15",
  },
  {
    key: "status",
    label: "Status",
    required: false,
    example: "Approved",
  },
  {
    key: "amount",
    label: "Amount (GHS)",
    required: false,
    example: "150000",
  },
];

export function BulkImportExample() {
  const { open, onOpenChange, openWith } = useModalSearchParam("bulk-import");

  const handleComplete = useCallback(
    (result: BulkImportResult) => {
      console.log("Import complete:", result);
      onOpenChange(false);
    },
    [onOpenChange],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="demo-button" onClick={() => openWith()}>
          Open bulk import
        </button>
      </div>
      <BulkImportModal
        open={open}
        onOpenChange={onOpenChange}
        title="Import documents"
        fields={fields}
        onComplete={handleComplete}
      />
    </div>
  );
}
