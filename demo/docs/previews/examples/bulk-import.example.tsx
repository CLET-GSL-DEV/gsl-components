import type { BulkImportField } from "@rfdtech/components";
import { BulkImportModal, useModalSearchParam } from "@rfdtech/components";
import { useCallback } from "react";

const TEMPLATE_HEADERS = [
  "organisation_name",
  "organisation_email",
  "document_name",
  "document_type",
  "date_submitted",
  "status",
  "amount",
];

const TEMPLATE_ROWS = [
  ["GSL Corporation", "info@gsl.edu.gh", "2024 Annual Budget", "Financial", "2024-01-15", "Approved", "150000"],
  ["TechHub Ltd", "admin@techhub.com", "Q1 Progress Report", "Report", "2024-02-20", "Pending", "45000"],
  ["MediCare Plus", "contact@medicare.org", "Compliance Audit 2024", "Audit", "2024-03-10", "Approved", "89000"],
  ["EduFirst Academy", "info@edufirst.edu", "Enrollment Statistics", "Statistics", "2024-04-05", "Draft", "12000"],
  ["GreenEnergy Solutions", "hello@greenenergy.io", "Sustainability Plan", "Plan", "2024-05-18", "Pending", "230000"],
  ["InvalidOrg", "not-an-email", "Missing Data", "", "invalid-date", "Unknown", "abc"],
];

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

function downloadTemplate() {
  const csv = [TEMPLATE_HEADERS.join(","), ...TEMPLATE_ROWS.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "bulk-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BulkImportExample() {
  const { open, onOpenChange, openWith } = useModalSearchParam("bulk-import");

  const handleComplete = useCallback(
    (result: any) => {
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
        <button type="button" className="demo-button" onClick={downloadTemplate}>
          Download template CSV
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "var(--gsl-text-secondary)" }}>
        Template includes 6 rows — 5 valid and 1 with intentional errors for testing validation.
      </p>
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
