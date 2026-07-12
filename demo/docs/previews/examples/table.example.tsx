import { useCallback, useState } from "react";
import { useTableState } from "@rfdtech/components";
import type { TableColumn, TableRowAction } from "@rfdtech/components";
import {
  Table,
  TableHeader,
  TableSearch,
  TableFilter,
  TableContent,
  TableBulkActions,
  TableFooter,
  TablePagination,
  Dropdown,
  Badge,
} from "@rfdtech/components";
import { Trash2, Eye, Edit } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const initialUsers: User[] = [
  { id: 1, name: "Kwame Asante", email: "kwame@gsl.edu.gh", role: "Admin", status: "Active" },
  { id: 2, name: "Abena Mensah", email: "abena@gsl.edu.gh", role: "Editor", status: "Active" },
  { id: 3, name: "Kofi Owusu", email: "kofi@gsl.edu.gh", role: "Viewer", status: "Inactive" },
  { id: 4, name: "Esi Boateng", email: "esi@gsl.edu.gh", role: "Editor", status: "Active" },
  { id: 5, name: "Yaw Adom", email: "yaw@gsl.edu.gh", role: "Viewer", status: "Pending" },
  { id: 6, name: "Nana Yeboah", email: "nana@gsl.edu.gh", role: "Admin", status: "Active" },
  { id: 7, name: "Akua Donkor", email: "akua@gsl.edu.gh", role: "Editor", status: "Active" },
  { id: 8, name: "Kwesi Appiah", email: "kwesi@gsl.edu.gh", role: "Viewer", status: "Inactive" },
  { id: 9, name: "Adwoa Sarpong", email: "adwoa@gsl.edu.gh", role: "Editor", status: "Active" },
  { id: 10, name: "Kobina Ennin", email: "kobina@gsl.edu.gh", role: "Viewer", status: "Pending" },
  { id: 11, name: "Efua Sutherland", email: "efua@gsl.edu.gh", role: "Editor", status: "Active" },
  { id: 12, name: "Paapa Essiedu", email: "paapa@gsl.edu.gh", role: "Viewer", status: "Inactive" },
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

const columns: TableColumn<User>[] = [
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

const rowActions: TableRowAction<User>[] = [
  { id: "view", label: "View", icon: <Eye size={14} strokeWidth={1.5} />, onClick: () => {} },
  { id: "edit", label: "Edit", icon: <Edit size={14} strokeWidth={1.5} />, onClick: () => {} },
  { id: "delete", label: "Delete", icon: <Trash2 size={14} strokeWidth={1.5} />, onClick: () => {}, variant: "destructive" },
];

export function TableExample() {
  const [users, setUsers] = useState(initialUsers);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const { page, pageSize, pageSizeOptions, search, filters } = useTableState({
    defaultPageSize: 5,
  });
  const [roleValue, setRoleValue] = useState(filters.role ?? "");

  const filtered = users.filter(
    (u) => {
      if (filters.role && u.role !== filters.role) return false;
      return (
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    },
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = useCallback((ids: Set<string | number>) => {
    setUsers((prev) => prev.filter((u) => !ids.has(u.id)));
    setSelected(new Set());
  }, []);

  return (
    <Table paramPrefix="users">
      <TableHeader>
        <TableSearch placeholder="Search users..." />
        <TableFilter>
          <Dropdown
            name="role"
            value={roleValue || null}
            onValueChange={(v) => setRoleValue(v ?? "")}
            options={[
              { value: "Admin", label: "Admin" },
              { value: "Editor", label: "Editor" },
              { value: "Viewer", label: "Viewer" },
            ]}
            placeholder="All roles"
            aria-label="Filter by role"
          />
        </TableFilter>
      </TableHeader>
      <TableContent
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        rowActions={rowActions}
        columns={columns}
        data={paged}
        rowKey={(u) => u.id}
      />
      <TableBulkActions
        selectedIds={selected}
        onClear={() => setSelected(new Set())}
        actions={[
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 size={14} strokeWidth={1.5} />,
            onClick: handleDelete,
            destructive: true,
          },
        ]}
      />
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
