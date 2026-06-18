import type { TableColumn } from "@rfdtech/components";
import { gslMembers, type GslMember } from "demo/data/demoHomeMembers";
import { useState } from "react";
import {
  Users,
  UserCheck,
  CalendarPlus,
  Activity,
  Trash2,
  X,
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
  Card,
  Dropdown,
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
  const { page, pageSize, pageSizeOptions, search, filters } = useTableState({ defaultPageSize: 10 });
  const [roleValue, setRoleValue] = useState(filters.role ?? "");
  const [statusValue, setStatusValue] = useState(filters.status ?? "");
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const filtered = gslMembers.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || m.status.toLowerCase() === filters.status;
    const matchRole = !filters.role || m.role.toLowerCase() === filters.role;
    return matchSearch && matchStatus && matchRole;
  });
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

      <Card>
        <Table paramPrefix="members">
          <TableHeader>
            <TableSearch placeholder="Search members..." />
            <div className="demo-filter-right">
              {selected.size > 0 ? (
                <div className="demo-home__selected-bar">
                  <span className="demo-home__selected-count">
                    {selected.size} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelected(new Set())}
                  >
                    <X size={14} strokeWidth={1.5} />
                    Clear
                  </Button>
                  <Button variant="primary" size="sm" style={{ gap: 6 }}>
                    <Trash2 size={14} strokeWidth={1.5} />
                    Delete
                  </Button>
                </div>
              ) : (
                <TableFilter>
                <div className="demo-home__filter-field">
                  <label className="demo-home__filter-label">Status</label>
                  <input type="hidden" name="status" value={statusValue} />
                  <Dropdown
                    value={statusValue}
                    onValueChange={(v) => setStatusValue(v ?? "")}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                      { value: "pending", label: "Pending" },
                    ]}
                    placeholder="All statuses"
                  />
                </div>
                <div className="demo-home__filter-field">
                  <label className="demo-home__filter-label">Role</label>
                  <input type="hidden" name="role" value={roleValue} />
                  <Dropdown
                    value={roleValue}
                    onValueChange={(v) => setRoleValue(v ?? "")}
                    options={[
                      { value: "admin", label: "Admin" },
                      { value: "editor", label: "Editor" },
                      { value: "viewer", label: "Viewer" },
                    ]}
                    placeholder="All roles"
                  />
                </div>
              </TableFilter>
              )}
            </div>
          </TableHeader>
          <TableContent
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            columns={columns}
            data={paged}
            rowKey={(m: GslMember) => m.id}
          />
          <TableFooter>
            <TablePagination totalPages={totalPages} totalItems={filtered.length} pageSizeOptions={pageSizeOptions} />
          </TableFooter>
        </Table>
      </Card>
    </>
  );
}
