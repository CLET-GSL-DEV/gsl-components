import type { TableColumn } from "@rfdtech/components";
import { gslMembers, type GslMember } from "demo/data/demoHomeMembers";
import {
  Users,
  UserCheck,
  CalendarPlus,
  Activity,
  Download,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableSearch,
  TableFilter,
  TableContent,
  TableFooter,
  TablePagination,
  MetricCard,
  Button,
  useTableState,
} from "@rfdtech/components";

const columns: TableColumn<GslMember>[] = [
  { id: "name", header: "Name", accessorKey: "name", sortable: true, cell: ({ value }) => <span className="demo-home__cell-name">{String(value)}</span> },
  { id: "email", header: "Email", accessorKey: "email", sortable: true },
  { id: "role", header: "Role", accessorKey: "role", sortable: true },
  { id: "status", header: "Status", accessorKey: "status", sortable: true, cell: ({ value }) => <span className={`demo-home__status demo-home__status--${String(value).toLowerCase()}`}>{String(value)}</span> },
  { id: "joined", header: "Joined", accessorKey: "joined", sortable: true, cell: ({ value }) => <span className="demo-home__cell-date">{String(value)}</span> },
];

export function DemoPage() {
  const { page, pageSize, pageSizeOptions, search, filters, setPage, setPageSize, setSearch } = useTableState({ defaultPageSize: 10 });

  const filtered = gslMembers.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="demo-home__metrics">
        <MetricCard label="Total Members" value={gslMembers.length} icon={<Users size={16} strokeWidth={1.5} />} description="Across all departments" trend="up" trendValue="+12%" />
        <MetricCard label="Active Members" value={gslMembers.filter((m) => m.status === "Active").length} icon={<UserCheck size={16} strokeWidth={1.5} />} description="Currently active" trend="up" trendValue="+5%" />
        <MetricCard label="New This Month" value={gslMembers.filter((m) => m.joined >= "2025-01-01").length} icon={<CalendarPlus size={16} strokeWidth={1.5} />} description="Joined this year" trend="down" trendValue="-3%" />
        <MetricCard label="Engagement Rate" value="94.2%" icon={<Activity size={16} strokeWidth={1.5} />} description="Average daily activity" trend="up" trendValue="+1.2%" />
      </div>

      <div className="demo-card">
        <Table>
          <TableHeader>
            <TableSearch placeholder="Search members..." onSearch={setSearch} />
            <div className="demo-filter-right">
              <TableFilter>
                <div className="demo-home__filter-field">
                  <label className="demo-home__filter-label">Status</label>
                  <select
                    name="status"
                    className="demo-home__filter-select"
                    defaultValue={filters.status ?? ""}
                  >
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="demo-home__filter-field">
                  <label className="demo-home__filter-label">Role</label>
                  <select
                    name="role"
                    className="demo-home__filter-select"
                    defaultValue={filters.role ?? ""}
                  >
                    <option value="">All</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </TableFilter>
              <Button>
                <Download size={14} strokeWidth={1.5} />
                Download CSV
              </Button>
            </div>
          </TableHeader>
          <TableContent columns={columns} data={paged} rowKey={(m: GslMember) => m.id} />
          <TableFooter>
            <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={pageSize} pageSizeOptions={pageSizeOptions} onPageSizeChange={setPageSize} />
          </TableFooter>
        </Table>
      </div>
    </>
  );
}
