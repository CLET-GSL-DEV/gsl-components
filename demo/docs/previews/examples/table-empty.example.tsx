import { useState } from "react";
import { useTableState } from "@rfdtech/components";
import type { TableColumn } from "@rfdtech/components";
import {
  Table,
  TableHeader,
  TableSearch,
  TableContent,
  TableFooter,
  TablePagination,
} from "@rfdtech/components";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: TableColumn<User>[] = [
  { id: "name", header: "Name", accessorKey: "name", sortable: true },
  { id: "email", header: "Email", accessorKey: "email", sortable: true },
  { id: "role", header: "Role", accessorKey: "role", sortable: true },
];

export function TableEmptyExample() {
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  useTableState({ defaultPageSize: 5 });

  const filtered: User[] = [];
  const totalPages = 0;

  return (
    <Table paramPrefix="users-empty">
      <TableHeader>
        <TableSearch placeholder="Search users..." />
      </TableHeader>
      <TableContent
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        columns={columns}
        data={filtered}
        rowKey={(u) => u.id}
        emptyText="No users found"
      />
      <TableFooter>
        <TablePagination
          totalPages={totalPages}
          pageSizeOptions={[5, 10, 20]}
        />
      </TableFooter>
    </Table>
  );
}
