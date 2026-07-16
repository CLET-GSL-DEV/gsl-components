import { useState } from "react";
import type { TableColumn } from "@rfdtech/components";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Table,
  TableContent,
  TableFooter,
  TablePagination,
  Badge,
  useTableState,
} from "@rfdtech/components";

interface Registrant {
  id: number;
  name: string;
  institution: string;
  status: string;
}

const registrants: Registrant[] = [
  { id: 1, name: "Kwame Asante", institution: "Achimota School", status: "Active" },
  { id: 2, name: "Abena Mensah", institution: "Wesley Girls' High", status: "Pending" },
  { id: 3, name: "Kofi Owusu", institution: "Prempeh College", status: "Active" },
  { id: 4, name: "Esi Boateng", institution: "Holy Child School", status: "Active" },
  { id: 5, name: "Yaw Adom", institution: "Mfantsipim School", status: "Pending" },
  { id: 6, name: "Nana Yeboah", institution: "Aburi Girls'", status: "Active" },
  { id: 7, name: "Akua Donkor", institution: "St. Augustine's", status: "Pending" },
  { id: 8, name: "Kwesi Appiah", institution: "Adisadel College", status: "Active" },
  { id: 9, name: "Adwoa Sarpong", institution: "Opoku Ware School", status: "Active" },
  { id: 10, name: "Kobina Ennin", institution: "Ghana National College", status: "Pending" },
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

const columns: TableColumn<Registrant>[] = [
  { id: "name", header: "Name", accessorKey: "name", sortable: true },
  { id: "institution", header: "Institution", accessorKey: "institution", sortable: true },
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

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["value"];

function filterByTab(data: Registrant[], tab: StatusTab): Registrant[] {
  if (tab === "active") return data.filter((r) => r.status === "Active");
  if (tab === "pending") return data.filter((r) => r.status === "Pending");
  return data;
}

/**
 * Status tabs act as a segment filter above ONE shared table — switching tabs
 * re-filters the same `data` array and resets pagination, rather than
 * mounting a separate `<Table>`/`<TableContent>` per tab.
 */
export function TableTabsFilterExample() {
  const [tab, setTab] = useState<StatusTab>("all");
  const { page, pageSize, pageSizeOptions, setPage } = useTableState({
    defaultPageSize: 5,
    paramPrefix: "registry-results",
  });

  const filtered = filterByTab(registrants, tab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Tabs
      variant="pill"
      value={tab}
      onValueChange={(value) => {
        setTab(value as StatusTab);
        setPage(1);
      }}
    >
      <TabsList>
        {STATUS_TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <Table paramPrefix="registry-results">
        <TableContent columns={columns} data={paged} rowKey={(r) => r.id} />
        <TableFooter>
          <TablePagination
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSizeOptions={pageSizeOptions}
          />
        </TableFooter>
      </Table>
    </Tabs>
  );
}
