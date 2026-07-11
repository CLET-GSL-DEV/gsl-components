import { useMemo, useState } from "react";
import { useTableState } from "@rfdtech/components";
import type { TableColumn } from "@rfdtech/components";
import {
  Table,
  TableHeader,
  TableSearch,
  TableFilter,
  TableContent,
  TableFooter,
  TablePagination,
  Dropdown,
  Badge,
} from "@rfdtech/components";

interface Member {
  id: number;
  name: string;
  role: string;
  status: string;
}

const members: Member[] = [
  { id: 1, name: "Kwame Asante", role: "Admin", status: "Active" },
  { id: 2, name: "Abena Mensah", role: "Editor", status: "Active" },
  { id: 3, name: "Kofi Owusu", role: "Viewer", status: "Inactive" },
  { id: 4, name: "Esi Boateng", role: "Editor", status: "Active" },
  { id: 5, name: "Yaw Adom", role: "Viewer", status: "Pending" },
  { id: 6, name: "Nana Yeboah", role: "Admin", status: "Active" },
];

function statusVariant(status: string) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "Pending":
      return "warning" as const;
    default:
      return "outline" as const;
  }
}

const columns: TableColumn<Member>[] = [
  { id: "name", header: "Name", accessorKey: "name", sortable: true },
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

export function TableFilterSpreadExample() {
  const { page, pageSize, pageSizeOptions, search, filters } = useTableState({
    defaultPageSize: 5,
    paramPrefix: "spread-filter",
  });
  const [roleValue, setRoleValue] = useState(filters.role ?? "");
  const [statusValue, setStatusValue] = useState(filters.status ?? "");

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchRole = !filters.role || m.role === filters.role;
        const matchStatus = !filters.status || m.status === filters.status;
        return matchSearch && matchRole && matchStatus;
      }),
    [search, filters],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Table paramPrefix="spread-filter">
      <TableHeader>
        <TableSearch placeholder="Search members..." />
        <TableFilter variant="spread">
          <input type="hidden" name="role" value={roleValue} />
          <Dropdown
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
          <input type="hidden" name="status" value={statusValue} />
          <Dropdown
            value={statusValue || null}
            onValueChange={(v) => setStatusValue(v ?? "")}
            options={[
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Pending", label: "Pending" },
            ]}
            placeholder="All statuses"
            aria-label="Filter by status"
          />
        </TableFilter>
      </TableHeader>
      <TableContent columns={columns} data={paged} rowKey={(m) => m.id} />
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
