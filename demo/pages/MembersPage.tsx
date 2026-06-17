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
  BulkImportModal,
  useTableState,
} from "@rfdtech/components";
import { Edit, Eye, MoreHorizontal, Upload } from "lucide-react";

function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 88%)`;
}

export function MembersPage() {
  const { data: membersData, loading: membersLoading } = useMockQuery(
    demoMembers,
    1200,
  );

  const { page, pageSize, pageSizeOptions, search, filters } = useTableState({
    defaultPageSize: 10,
  });

  const {
    page: invPage,
    pageSize: invPageSize,
    search: invSearch,
    filters: invFilters,
  } = useTableState({ defaultPageSize: 5, paramPrefix: "invoices" });

  const [selectedMember, setSelectedMember] = useState<DemoMember | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<DemoMember | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

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
            <div
              className="demo-member-avatar__circle"
              style={{
                background: nameToColor(row.name),
                borderColor: nameToColor(row.name),
              }}
            >
              {row.initials}
            </div>
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
          <span
            className={`demo-member-status demo-member-status--${String(value).toLowerCase()}`}
          >
            <span className="demo-member-status__dot" />
            {String(value)}
          </span>
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
      <div className="demo-card">
        <Table>
          <TableHeader>
            <TableSearch placeholder="Search members..." />
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
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
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
                    <option value="nbec member">NBEC Member</option>
                    <option value="nbec secretariat">NBEC Secretariat</option>
                    <option value="item writer">Item Writer</option>
                    <option value="moderator">Moderator</option>
                    <option value="examiner">Examiner</option>
                    <option value="candidate">Candidate</option>
                    <option value="system administrator">
                      System Administrator
                    </option>
                  </select>
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
      </div>

      <div className="demo-card">
        <Table paramPrefix="invoices">
          <TableHeader>
            <TableSearch placeholder="Search invoices..." />
            <div className="demo-filter-right">
              <TableFilter>
                <div className="demo-home__filter-field">
                  <label className="demo-home__filter-label">Status</label>
                  <select
                    name="status"
                    className="demo-home__filter-select"
                    defaultValue={invFilters.status ?? ""}
                  >
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </TableFilter>
            </div>
          </TableHeader>
          <TableContent
            columns={[
              { id: "name", header: "Name", accessorKey: "name" },
              { id: "email", header: "Email", accessorKey: "email" },
              { id: "role", header: "Role", accessorKey: "role" },
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
            />
          </TableFooter>
        </Table>
      </div>

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
        fields={[
          { key: "name", label: "Full Name", required: true },
          {
            key: "email",
            label: "Email",
            required: true,
            type: "email" as const,
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
