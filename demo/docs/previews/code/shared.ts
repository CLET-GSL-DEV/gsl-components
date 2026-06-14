import type { BulkImportField } from "@rfdtech/components";

export const importFields: BulkImportField[] = [
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
