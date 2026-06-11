import { useState } from "react";
import {
  AppSwitcher,
  BulkImportModal,
  Combobox,
  Dropdown,
  DropdownMenu,
} from "@rfdtech/components";
import type {
  BulkImportField,
  BulkImportResult,
  DropdownOption,
} from "@rfdtech/components";

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

const departmentOptions = [
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
  { value: "legal", label: "Legal" },
];

const allUsers: DropdownOption[] = [
  { value: "u1", label: "Ada Lovelace" },
  { value: "u2", label: "Grace Hopper" },
  { value: "u3", label: "Katherine Johnson" },
  { value: "u4", label: "Alan Turing" },
];

const loadUsers = (query: string): Promise<DropdownOption[]> =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      const normalizedQuery = query.toLowerCase();
      resolve(
        allUsers.filter((user) =>
          user.label.toLowerCase().includes(normalizedQuery),
        ),
      );
    }, 400);
  });

export function App() {
  const [importOpen, setImportOpen] = useState(false);
  const [lastImport, setLastImport] = useState<BulkImportResult | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
          system directory, or try the dropdowns and bulk import modal below.
        </p>

        <div className="demo-dropdowns">
          <Combobox
            ariaLabel="User"
            value={userId}
            onChange={setUserId}
            loadOptions={loadUsers}
            placeholder="Search users..."
            clearable
            className="demo-combobox"
            getOptionLabel={(id) => allUsers.find((user) => user.value === id)?.label}
          />
          <Dropdown
            ariaLabel="Department"
            value={department}
            onChange={setDepartment}
            placeholder="Choose department..."
            clearable
            options={departmentOptions}
            className="demo-dropdown"
          />
          <DropdownMenu
            ariaLabel="Demo actions"
            trigger={<span className="demo-menu-trigger">Actions</span>}
            items={[
              {
                id: "log",
                label: "Log selection",
                onSelect: () =>
                  console.log("Department:", department ?? "(none)"),
              },
              {
                id: "docs",
                label: "Documentation",
                href: "https://github.com",
              },
            ]}
          />
        </div>

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
