import { useState, type CSSProperties } from "react";
import { AppSwitcher, BulkImportModal } from "@gsl/components";
import type { BulkImportField, BulkImportResult } from "@gsl/components";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const accessToken = import.meta.env.VITE_ACCESS_TOKEN ?? "demo-token";

const importFields: BulkImportField[] = [
  {
    key: "organisation_name",
    label: "Organisation Name",
    required: true,
    example: "GSL",
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
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>My Workspace</div>
        <nav style={styles.nav}>
          <a href="#" style={styles.navLink}>
            Home
          </a>
          <a href="#" style={styles.navLink}>
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

      <main style={styles.main}>
        <h1 style={styles.heading}>GSL Components Demo</h1>
        <p style={styles.text}>
          Shared React components for Ghana School of Law projects. Click the
          9-dot grid icon in the top-right corner to open the AppSwitcher
          system directory, or try the bulk import modal below.
        </p>

        <button
          type="button"
          style={styles.button}
          onClick={() => setImportOpen(true)}
        >
          Open bulk import
        </button>

        {lastImport && (
          <p style={styles.result}>
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

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    margin: 0,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: "#f8f9fa",
    color: "#3c4043",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    background: "#fff",
    borderBottom: "1px solid #dadce0",
  },
  logo: {
    fontSize: 22,
    fontWeight: 500,
    color: "#5f6368",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  navLink: {
    color: "#5f6368",
    textDecoration: "none",
    fontSize: 14,
  },
  main: {
    maxWidth: 640,
    margin: "80px auto",
    padding: "0 24px",
    textAlign: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: 400,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 1.6,
    color: "#5f6368",
    marginBottom: 24,
  },
  button: {
    padding: "10px 18px",
    border: "1px solid #dadce0",
    borderRadius: 8,
    background: "#dc2626",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
  },
  result: {
    marginTop: 16,
    fontSize: 14,
    color: "#5f6368",
  },
};
