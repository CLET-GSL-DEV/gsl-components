import type { TableColumn, TableBulkAction, TableRowAction } from "@rfdtech/components";
import { gslMembers, type GslMember } from "demo/data/demoHomeMembers";
import { useMockQuery } from "demo/hooks/useMockQuery";
import { useCallback, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  CalendarPlus,
  Activity,
  Trash2,
  UserX,
  Eye,
  Edit,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableSearch,
  TableFilter,
  TableContent,
  TableBulkActions,
  TableFooter,
  TablePagination,
  MetricCard,
  Card,
  Dropdown,
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
  useTableState,
  Badge,
} from "@rfdtech/components";

function statusVariant(status: string) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "Pending":
      return "warning" as const;
    case "Inactive":
      return "outline" as const;
    case "Suspended":
      return "warning" as const;
    case "Terminated":
      return "error" as const;
    default:
      return "default" as const;
  }
}

const columns: TableColumn<GslMember>[] = [
  { id: "name", header: "Name", accessorKey: "name", sortable: true, cell: ({ value }) => <span className="demo-home__cell-name">{String(value)}</span> },
  { id: "email", header: "Email", accessorKey: "email", sortable: true },
  { id: "role", header: "Role", accessorKey: "role", sortable: true },
  { id: "status", header: "Status", accessorKey: "status", sortable: true, cell: ({ value }) => <Badge variant={statusVariant(String(value))}>{String(value)}</Badge> },
  { id: "joined", header: "Joined", accessorKey: "joined", sortable: true, cell: ({ value }) => <span className="demo-home__cell-date">{String(value)}</span> },
];

export function DemoPage() {
  const { page, pageSize, pageSizeOptions, search, filters } = useTableState({ defaultPageSize: 10, paramPrefix: "members" });
  const [roleValue, setRoleValue] = useState(filters.role ?? "");
  const [statusValue, setStatusValue] = useState(filters.status ?? "");
  const [members, setMembers] = useState(gslMembers);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [viewMember, setViewMember] = useState<GslMember | null>(null);
  const { loading: metricsLoading } = useMockQuery(null, 1200);

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || m.status.toLowerCase() === filters.status;
    const matchRole = !filters.role || m.role.toLowerCase() === filters.role;
    return matchSearch && matchStatus && matchRole;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const bulkActions: TableBulkAction[] = [
    {
      id: "activate",
      label: "Activate",
      icon: <UserCheck size={14} strokeWidth={1.5} />,
      onClick: (ids) => {
        setMembers((prev) =>
          prev.map((m) => (ids.has(m.id) ? { ...m, status: "Active" } : m)),
        );
        setSelected(new Set());
      },
    },
    {
      id: "deactivate",
      label: "Deactivate",
      icon: <UserX size={14} strokeWidth={1.5} />,
      onClick: (ids) => {
        setMembers((prev) =>
          prev.map((m) => (ids.has(m.id) ? { ...m, status: "Inactive" } : m)),
        );
        setSelected(new Set());
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 size={14} strokeWidth={1.5} />,
      onClick: (ids) => {
        setMembers((prev) => prev.filter((m) => !ids.has(m.id)));
        setSelected(new Set());
      },
      destructive: true,
    },
  ];

  const handleView = useCallback((member: GslMember) => {
    setViewMember(member);
  }, []);

  const rowActions = useMemo<TableRowAction<GslMember>[]>(
    () => [
      { id: "view", label: "View", icon: <Eye size={14} strokeWidth={1.5} />, onClick: handleView },
      { id: "edit", label: "Edit", icon: <Edit size={14} strokeWidth={1.5} />, onClick: handleView },
      { id: "delete", label: "Delete", icon: <Trash2 size={14} strokeWidth={1.5} />, onClick: handleView, variant: "destructive" },
    ],
    [handleView],
  );

  return (
    <>
      <div className="demo-home__metrics">
        <MetricCard loading={metricsLoading} label="Total Members" value={members.length} icon={<Users size={16} strokeWidth={1.5} />} description="Across all departments" trend="up" trendValue="+12%" />
        <MetricCard loading={metricsLoading} label="Active Members" value={members.filter((m) => m.status === "Active").length} icon={<UserCheck size={16} strokeWidth={1.5} />} description="Currently active" trend="up" trendValue="+5%" />
        <MetricCard loading={metricsLoading} label="New This Month" value={members.filter((m) => m.joined >= "2025-01-01").length} icon={<CalendarPlus size={16} strokeWidth={1.5} />} description="Joined this year" trend="down" trendValue="-3%" />
        <MetricCard loading={metricsLoading} label="Engagement Rate" value="94.2%" icon={<Activity size={16} strokeWidth={1.5} />} description="Average daily activity" trend="up" trendValue="+1.2%" />
      </div>

      <Card>
        <Table paramPrefix="members">
          <TableHeader>
            <TableSearch placeholder="Search members..." />
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
          </TableHeader>
          <TableContent
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            rowActions={rowActions}
            columns={columns}
            data={paged}
            rowKey={(m: GslMember) => m.id}
          />
          <TableBulkActions
            selectedIds={selected}
            onClear={() => setSelected(new Set())}
            actions={bulkActions}
          />
          <TableFooter>
            <TablePagination totalPages={totalPages} totalItems={filtered.length} pageSizeOptions={pageSizeOptions} />
          </TableFooter>
        </Table>
      </Card>

      <Modal open={viewMember !== null} onOpenChange={(open) => { if (!open) setViewMember(null); }}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent showCloseButton>
            <ModalHeader>
              <ModalTitle>{viewMember?.name}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className="demo-member-detail">
                <div className="demo-member-detail__row">
                  <span className="demo-member-detail__label">Email</span>
                  <span className="demo-member-detail__value">{viewMember?.email}</span>
                </div>
                <div className="demo-member-detail__row">
                  <span className="demo-member-detail__label">Role</span>
                  <span className="demo-member-detail__value">{viewMember?.role}</span>
                </div>
                <div className="demo-member-detail__row">
                  <span className="demo-member-detail__label">Status</span>
                  <span className="demo-member-detail__value">
                    <Badge variant={statusVariant(viewMember?.status ?? "")}>{viewMember?.status}</Badge>
                  </span>
                </div>
                <div className="demo-member-detail__row">
                  <span className="demo-member-detail__label">Joined</span>
                  <span className="demo-member-detail__value">{viewMember?.joined}</span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setViewMember(null)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </>
  );
}
