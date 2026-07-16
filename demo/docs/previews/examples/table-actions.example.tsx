import type { TableColumn } from "@rfdtech/components";
import {
  Table,
  TableHeader,
  TableSearch,
  TableActions,
  TableContent,
  TableFooter,
  TablePagination,
  Badge,
  Dropdown,
  useTableState,
} from "@rfdtech/components";

interface RoleAssignment {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const assignments: RoleAssignment[] = [
  { id: 1, name: "Kwame Asante", email: "kwame@clet.edu.gh", role: "Admin", status: "Active" },
  { id: 2, name: "Abena Mensah", email: "abena@clet.edu.gh", role: "Editor", status: "Active" },
  { id: 3, name: "Kofi Owusu", email: "kofi@clet.edu.gh", role: "Viewer", status: "Inactive" },
  { id: 4, name: "Esi Boateng", email: "esi@clet.edu.gh", role: "Editor", status: "Active" },
  { id: 5, name: "Yaw Adom", email: "yaw@clet.edu.gh", role: "Viewer", status: "Pending" },
  { id: 6, name: "Nana Yeboah", email: "nana@clet.edu.gh", role: "Admin", status: "Active" },
  { id: 7, name: "Akua Donkor", email: "akua@clet.edu.gh", role: "Editor", status: "Active" },
  { id: 8, name: "Kwesi Appiah", email: "kwesi@clet.edu.gh", role: "Viewer", status: "Inactive" },
];

const roleOptions = [
  { value: "Admin", label: "Admin" },
  { value: "Editor", label: "Editor" },
  { value: "Viewer", label: "Viewer" },
];

function statusVariant(status: string) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "Pending":
      return "warning" as const;
    case "Inactive":
      return "outline" as const;
    default:
      return "default" as const;
  }
}

const columns: TableColumn<RoleAssignment>[] = [
  { id: "name", header: "Name", accessorKey: "name", sortable: true },
  { id: "email", header: "Email", accessorKey: "email", sortable: true },
  { id: "role", header: "Role", accessorKey: "role", sortable: true },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    cell: ({ value }) => (
      <Badge variant={statusVariant(String(value))}>{String(value)}</Badge>
    ),
  },
];

interface RolesFilters {
  role: string | null;
  [key: string]: string | null | undefined;
}

export function TableActionsExample() {
  // `useTableState`'s `filters` bag is exactly what a `TableActions` filter
  // control (here a `Dropdown`) reads from and writes to — the toolbar slot
  // itself is just a styled flex wrapper, it has no filtering logic of its own.
  const { page, pageSize, pageSizeOptions, search, filters, setFilter } =
    useTableState<RolesFilters>({
      defaultPageSize: 5,
      paramPrefix: "role-assignments",
    });

  const filtered = assignments.filter((a) => {
    if (filters.role && a.role !== filters.role) return false;
    return (
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Table paramPrefix="role-assignments">
      <TableHeader>
        <TableSearch placeholder="Search by name or email..." />
        <TableActions>
          <div style={{ width: 180 }}>
            <Dropdown
              aria-label="Filter by role"
              value={filters.role ?? null}
              onValueChange={(value) => setFilter("role", value)}
              options={roleOptions}
              placeholder="All roles"
              clearable
            />
          </div>
        </TableActions>
      </TableHeader>
      <TableContent columns={columns} data={paged} rowKey={(a) => a.id} />
      <TableFooter>
        <TablePagination
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSizeOptions={pageSizeOptions}
        />
      </TableFooter>
    </Table>
  );
}
