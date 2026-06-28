import { useMemo, useState } from "react";
import { demoMembers, type DemoMember } from "../data/demoMembers";
import { useMockQuery } from "../hooks/useMockQuery";
import { ViewMemberModal } from "../components/ViewMemberModal";
import { EditMemberModal } from "../components/EditMemberModal";
import type { TableColumn } from "@rfdtech/components";
import {
  Table,
  TableHeader,
  TableSearch,
  TableFilter,
  TableContent,
  TableFooter,
  TablePagination,
  Button,
  Card,
  Dropdown,
  BulkImportModal,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useTableState,
  Badge,
  Avatar,
} from "@rfdtech/components";
import { Edit, Eye, Upload, MoreHorizontal } from "lucide-react";

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

export function MembersPage() {
  const { data: membersData, loading: membersLoading } = useMockQuery(
    demoMembers,
    1200,
  );

  const { page, pageSize, pageSizeOptions, search, filters } = useTableState({
    defaultPageSize: 10,
    paramPrefix: "members",
  });

  const {
    page: invPage,
    pageSize: invPageSize,
    pageSizeOptions: invPageSizeOptions,
    search: invSearch,
    filters: invFilters,
  } = useTableState({
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 20, 50],
    paramPrefix: "invoices",
  });

  const [selectedMember, setSelectedMember] = useState<DemoMember | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<DemoMember | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const [statusValue, setStatusValue] = useState(filters.status ?? "");
  const [roleValue, setRoleValue] = useState(filters.role ?? "");
  const [invStatusValue, setInvStatusValue] = useState(invFilters.status ?? "");

  const handleViewMember = (id: number) => {
    const member = demoMembers.find((m) => m.id === id);
    if (member) {
      setSelectedMember(member);
      setViewModalOpen(true);
    }
  };

  const columns = useMemo<TableColumn<DemoMember>[]>(
    () => [
      {
        id: "name",
        header: "User",
        accessorKey: "name",
        sortable: true,
        cell: ({ row }) => (
          <div className="demo-member-avatar">
            <Avatar name={row.name} size="md" />
            <span>{row.name}</span>
          </div>
        ),
      },
      { id: "email", header: "Email", accessorKey: "email", sortable: true },
      {
        id: "role",
        header: "Primary Role",
        accessorKey: "role",
        sortable: true,
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: ({ value }) => (
          <Badge variant={statusVariant(String(value))}>{String(value)}</Badge>
        ),
      },
      { id: "phone", header: "Phone", accessorKey: "phone", sortable: true },
      {
        id: "lastLogin",
        header: "Last Login",
        accessorKey: "lastLoginDate",
        sortable: true,
        cell: ({ row }) => (
          <span>
            {row.lastLoginDate}
            <span
              style={{
                color: "var(--gsl-text-muted)",
                marginLeft: 6,
                fontSize: 12,
              }}
            >
              {row.lastLoginTime}
            </span>
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="demo-member-actions">
            <button
              type="button"
              className="demo-member-actions__btn"
              aria-label={`View ${row.name}`}
              onClick={(e) => {
                e.stopPropagation();
                handleViewMember(row.id);
              }}
            >
              <Eye size={14} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="demo-member-actions__btn"
              aria-label={`Edit ${row.name}`}
              onClick={(e) => {
                e.stopPropagation();
                setEditMember(row);
                setEditModalOpen(true);
              }}
            >
              <Edit size={14} strokeWidth={1.5} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const allMembers = membersData ?? [];
  const filtered = allMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="demo-members-page">
      <Card>
        <Table paramPrefix="members">
          <TableHeader>
            <TableSearch placeholder="Search members..." />
            <div className="demo-filter-right">
              <TableFilter>
                <div className="demo-home__filter-field">
                  <label className="demo-home__filter-label">Status</label>
                  <input type="hidden" name="status" value={statusValue} />
                  <Dropdown
                    value={statusValue}
                    onValueChange={(v) => setStatusValue(v ?? "")}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "suspended", label: "Suspended" },
                      { value: "terminated", label: "Terminated" },
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
                      { value: "nbec member", label: "NBEC Member" },
                      { value: "nbec secretariat", label: "NBEC Secretariat" },
                      { value: "item writer", label: "Item Writer" },
                      { value: "moderator", label: "Moderator" },
                      { value: "examiner", label: "Examiner" },
                      { value: "candidate", label: "Candidate" },
                      {
                        value: "system administrator",
                        label: "System Administrator",
                      },
                    ]}
                    placeholder="All roles"
                  />
                </div>
              </TableFilter>
              <Button onClick={() => setBulkImportOpen(true)}>
                <Upload size={14} strokeWidth={1.5} />
                Bulk Import
              </Button>
            </div>
          </TableHeader>
          <TableContent
            columns={columns}
            data={paged}
            rowKey={(m: DemoMember) => m.id}
            loading={membersLoading}
            loadingRows={10}
          />
          <TableFooter>
            <TablePagination
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSizeOptions={pageSizeOptions}
            />
          </TableFooter>
        </Table>
      </Card>

      <Card>
        <Table paramPrefix="invoices">
          <TableHeader>
            <TableSearch placeholder="Search invoices..." />
            <div className="demo-filter-right">
              <TableFilter>
                <div className="demo-home__filter-field">
                  <label className="demo-home__filter-label">Status</label>
                  <input type="hidden" name="status" value={invStatusValue} />
                  <Dropdown
                    value={invStatusValue}
                    onValueChange={(v) => setInvStatusValue(v ?? "")}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                      { value: "pending", label: "Pending" },
                    ]}
                    placeholder="All statuses"
                  />
                </div>
              </TableFilter>
            </div>
          </TableHeader>
          <TableContent
            columns={[
              { id: "name", header: "Name", accessorKey: "name" },
              { id: "email", header: "Email", accessorKey: "email" },
              { id: "role", header: "Role", accessorKey: "role" },
              {
                id: "actions",
                header: "",
                cell: () => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="demo-home__action-btn" aria-label="Row actions">
                        <MoreHorizontal size={14} strokeWidth={1.5} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="demo-home__action-menu" side="bottom" align="end" sideOffset={4}>
                      <button type="button" className="demo-home__action-menu-item">
                        <Eye size={14} strokeWidth={1.5} />
                        View
                      </button>
                      <button type="button" className="demo-home__action-menu-item">
                        <Edit size={14} strokeWidth={1.5} />
                        Edit
                      </button>
                    </PopoverContent>
                  </Popover>
                ),
              },
            ]}
            data={demoMembers
              .filter(
                (m) =>
                  m.name.toLowerCase().includes(invSearch.toLowerCase()) ||
                  m.email.toLowerCase().includes(invSearch.toLowerCase()),
              )
              .slice((invPage - 1) * invPageSize, invPage * invPageSize)}
            rowKey={(m: DemoMember) => m.id}
          />
          <TableFooter>
            <TablePagination
              totalPages={Math.max(
                1,
                Math.ceil(
                  demoMembers.filter(
                    (m) =>
                      m.name.toLowerCase().includes(invSearch.toLowerCase()) ||
                      m.email.toLowerCase().includes(invSearch.toLowerCase()),
                  ).length / invPageSize,
                ),
              )}
              totalItems={
                demoMembers.filter(
                  (m) =>
                    m.name.toLowerCase().includes(invSearch.toLowerCase()) ||
                    m.email.toLowerCase().includes(invSearch.toLowerCase()),
                ).length
              }
              pageSizeOptions={invPageSizeOptions}
            />
          </TableFooter>
        </Table>
      </Card>

      <ViewMemberModal
        member={selectedMember}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
      <EditMemberModal
        member={editMember}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
      <BulkImportModal
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        title="Import Members"
        maxFileSizeBytes={1024 * 1024 * 5}
        fields={[
          {
            key: "name",
            label: "Full Name",
            required: true,
            matchKeys: ["name", "fullName"],
          },
          {
            key: "email",
            label: "Email",
            required: true,
            type: "email" as const,
            unique: true,
            matchKeys: ["email", "emailAddress"],
          },
          {
            key: "role",
            label: "Primary Role",
            required: true,
            options: [
              "NBEC Member",
              "NBEC Secretariat",
              "Item Writer",
              "Moderator",
              "Examiner",
              "Candidate",
              "System Administrator",
            ],

            matchKeys: ["role", "roleName"],
          },
          {
            key: "status",
            label: "Status",
            options: [
              "Active",
              "Suspended",
              "Terminated",
              "Inactive",
              "Pending",
            ],

            matchKeys: ["status"],
          },
          { key: "phone", label: "Phone Number" },
          { key: "isr", label: "ISR Number" },
        ]}
        onComplete={(result) => {
          console.log("Imported rows:", result.rows.length);
        }}
      />
    </div>
  );
}
