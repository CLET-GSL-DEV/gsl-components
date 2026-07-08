import { useState } from "react";
import { useTableState } from "@rfdtech/components";
import type { TableColumn } from "@rfdtech/components";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableContent,
  TableFooter,
  TablePagination,
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

const TABS = [
  { value: "all", label: "All", data: members },
  {
    value: "active",
    label: "Active",
    data: members.filter((m) => m.status === "Active"),
  },
  {
    value: "pending",
    label: "Pending",
    data: members.filter((m) => m.status === "Pending"),
  },
];

function PanelTable({ prefix, data }: { prefix: string; data: Member[] }) {
  const { page, pageSize, pageSizeOptions } = useTableState({
    defaultPageSize: 5,
    paramPrefix: prefix,
  });
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paged = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Table paramPrefix={prefix}>
      <TableContent
        variant="panel"
        columns={columns}
        data={paged}
        rowKey={(m) => m.id}
      />
      <TableFooter>
        <TablePagination
          totalPages={totalPages}
          totalItems={data.length}
          pageSizeOptions={pageSizeOptions}
        />
      </TableFooter>
    </Table>
  );
}

export function TablePanelExample() {
  const [tab, setTab] = useState("all");

  return (
    <Tabs variant="pill" value={tab} onValueChange={setTab}>
      <TabsList>
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          <PanelTable prefix={`panel-${t.value}`} data={t.data} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
