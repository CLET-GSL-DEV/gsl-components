import { useState } from "react";
import { useTableState } from "@rfdtech/components";
import type { TableColumn } from "@rfdtech/components";
import {
  Table,
  TableHeader,
  TableSearch,
  TableContent,
  TableBulkActions,
  TableFooter,
  TablePagination,
} from "@rfdtech/components";
import { Trash2 } from "lucide-react";

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
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background:
              String(value) === "Active"
                ? "var(--gsl-primary)"
                : String(value) === "Pending"
                  ? "#f59e0b"
                  : "var(--gsl-text-muted)",
          }}
        />
        {String(value)}
      </span>
    ),
  },
];

export function TableExample() {
  const [users, setUsers] = useState(initialUsers);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const { page, pageSize, pageSizeOptions, search } = useTableState({
    defaultPageSize: 5,
  });

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (ids: Set<string | number>) => {
    setUsers((prev) => prev.filter((u) => !ids.has(u.id)));
    setSelected(new Set());
  };

  return (
    <Table paramPrefix="users">
      <TableHeader>
        <TableSearch placeholder="Search users..." />
      </TableHeader>
      <TableContent
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
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
