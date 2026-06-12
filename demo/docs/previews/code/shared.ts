import type { BulkImportField, DropdownOption } from "@rfdtech/components";

export const departmentOptions = [
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
  { value: "legal", label: "Legal" },
];

export const allUsers: DropdownOption[] = [
  { value: "u1", label: "Ada Lovelace" },
  { value: "u2", label: "Grace Hopper" },
  { value: "u3", label: "Katherine Johnson" },
  { value: "u4", label: "Alan Turing" },
];

export const staffColumns = [
  { key: "name", label: "Name", sortable: true },
  { key: "department", label: "Department", sortable: true },
  { key: "role", label: "Role", sortable: true },
];

export const staffData = [
  { name: "Ada Lovelace", department: "Engineering", role: "Lead" },
  { name: "Grace Hopper", department: "Engineering", role: "Architect" },
  { name: "Katherine Johnson", department: "Research", role: "Analyst" },
  { name: "Alan Turing", department: "Research", role: "Scientist" },
  { name: "Marie Curie", department: "Science", role: "Director" },
  { name: "Nikola Tesla", department: "Engineering", role: "Engineer" },
];

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

export const loadUsers = (query: string): Promise<DropdownOption[]> =>
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
