import { useState } from "react";
import { AppSwitcher, BulkImportModal } from "@rfdtech/components";
import type { BulkImportField, BulkImportResult } from "@rfdtech/components";

const baseUrl =  "";
const accessToken ="demo-token";

const importFields: BulkImportField[] = [
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
  {
    key: "document_id",
    label: "Document ID",
    required: true,
    example: "INV-2024-001",
  },
  {
    key: "department",
    label: "Department",
    example: "Finance",
  },
  {
    key: "month",
    label: "Month",
    example: "January",
  },
  {
    key: "year",
    label: "Year",
    example: "2024",
  },
];

export function App() {
  const [importOpen, setImportOpen] = useState(false);
  const [lastImport, setLastImport] = useState<BulkImportResult | null>(null);

  return (
    <div className="demo-page">
      <header className="demo-header">
        <div className="demo-logo">My Workspace</div>
        <nav className="demo-nav">
          <a href="#" className="demo-nav-link">
            Home
          </a>
          <a href="#" className="demo-nav-link">
            Settings
          </a>
          <AppSwitcher
            baseUrl={baseUrl}
            accessToken={accessToken}
            title="System directory"
            onAppSelect={(app) => console.log("Selected:", app.name, app.metadata)}
          />
        </nav>
      </header>

      <main className="demo-main">
        <h1 className="demo-heading">GSL Components Demo</h1>
        <p className="demo-text">
          Shared React components for Ghana School of Law projects. Click the
          9-dot grid icon in the top-right corner to open the AppSwitcher
          system directory, or try the bulk import modal below.
        </p>

        <button
          type="button"
          className="demo-button"
          onClick={() => setImportOpen(true)}
        >
          Open bulk import
        </button>

        {lastImport && (
          <p className="demo-result">
            Last import: {lastImport.rows.length} row(s),{" "}
            {lastImport.errors.length} error(s)
          </p>
        )}
      </main>

      <BulkImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import documents"
        fields={importFields}
        onComplete={(result) => {
          setLastImport(result);
          console.log("Import complete:", result);
        }}
      />
    </div>
  );
}
