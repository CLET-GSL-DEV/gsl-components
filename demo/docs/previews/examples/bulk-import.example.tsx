import { useState } from "react";
import type { BulkImportField } from "@rfdtech/components";
import { BulkImportModal } from "@rfdtech/components";

const fields: BulkImportField[] = [
  {
    key: "organisation_name",
    label: "Organisation Name",
    required: true,
    example: "GSL",
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
    example: "2024 Budget",
  },
];

export function BulkImportExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="demo-button" onClick={() => setOpen(true)}>
        Open bulk import
      </button>
      <BulkImportModal
        open={open}
        onOpenChange={setOpen}
        title="Import documents"
        fields={fields}
        onComplete={(result) => {
          console.log("Import complete:", result);
          setOpen(false);
        }}
      />
    </>
  );
}
