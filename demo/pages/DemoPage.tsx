import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BulkImportModal,
  Combobox,
  DataTable,
  Dropdown,
  DropdownMenu,
  INPUT_MASK_PRESETS,
  InputMask,
} from "@rfdtech/components";
import type {
  BulkImportField,
  BulkImportResult,
  DropdownOption,
} from "@rfdtech/components";
import { DemoLayout } from "../components/DemoLayout";

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

type StaffRecord = {
  name: string;
  department: string;
  role: string;
};

const staffColumns = [
  { key: "name", label: "Name", sortable: true },
  { key: "department", label: "Department", sortable: true },
  { key: "role", label: "Role", sortable: true },
];

const exampleColumns = [
  { key: "name", label: "Name", sortable: true },
  { key: "department", label: "Department", sortable: true },
];

const staffData: StaffRecord[] = [
  { name: "Ada Lovelace", department: "Engineering", role: "Lead" },
  { name: "Grace Hopper", department: "Engineering", role: "Architect" },
  { name: "Katherine Johnson", department: "Research", role: "Analyst" },
  { name: "Alan Turing", department: "Research", role: "Scientist" },
  { name: "Marie Curie", department: "Science", role: "Director" },
  { name: "Nikola Tesla", department: "Engineering", role: "Engineer" },
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

export function DemoPage() {
  const [importOpen, setImportOpen] = useState(false);
  const [lastImport, setLastImport] = useState<BulkImportResult | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [exampleStaff, setExampleStaff] = useState<StaffRecord[]>([]);
  const [exampleLoading, setExampleLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setExampleStaff(staffData);
      setExampleLoading(false);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <DemoLayout>
      <h1 className="demo-heading">GSL Components Demo</h1>
      <p className="demo-text">
        Shared React components for Ghana School of Law projects. Browse the{" "}
        <Link to="/docs">component docs</Link>, try the interactive examples
        below, or open the AppSwitcher from the header.
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
              href: "/docs",
            },
          ]}
        />
      </div>

      <section className="demo-section">
        <h2 className="demo-section-title">InputMask</h2>
        <p className="demo-text">
          Ghana phone format using <code>INPUT_MASK_PRESETS.phoneGh</code>.
        </p>
        <InputMask
          ariaLabel="Phone number"
          mask={INPUT_MASK_PRESETS.phoneGh}
          value={phone}
          onChange={setPhone}
          placeholder="0XX XXX XXXX"
          inputMode="tel"
          className="demo-input-mask"
        />
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Static DataTable</h2>
        <DataTable
          columns={staffColumns}
          data={staffData}
          className="demo-data-table"
          onRowClick={(row) => console.log("Selected staff:", row.name)}
        />
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Example DataTable</h2>
        <p className="demo-text">
          Fetches data in the parent and passes <code>data</code> and{" "}
          <code>loading</code> — same pattern as the docs.
        </p>
        <DataTable
          columns={exampleColumns}
          data={exampleStaff}
          loading={exampleLoading}
          emptyText="No staff found."
          className="demo-data-table"
          onRowClick={(row) => console.log("Selected staff:", row.name)}
        />
      </section>

      <section className="demo-section">
        <h2 className="demo-section-title">Empty DataTable</h2>
        <DataTable
          columns={staffColumns}
          data={[]}
          emptyText="No staff records yet."
          className="demo-data-table"
        />
      </section>

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
    </DemoLayout>
  );
}
