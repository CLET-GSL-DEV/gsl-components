import { useState } from "react";
import { useTableState } from "@rfdtech/components";
import type { TableColumn, DateRangeValue } from "@rfdtech/components";
import {
  Table,
  TableHeader,
  TableSearch,
  TableFilter,
  TableContent,
  TableFooter,
  TablePagination,
  DateRangeSelector,
  Badge,
  Button,
} from "@rfdtech/components";
import { ShieldAlert, SearchX } from "lucide-react";

interface AuditLogEntry {
  id: number;
  actor: string;
  action: string;
  target: string;
  status: "success" | "failed" | "warning";
  timestamp: Date;
}

const auditLog: AuditLogEntry[] = [
  { id: 1, actor: "kwame@gsl.edu.gh", action: "Login", target: "Portal", status: "success", timestamp: new Date("2026-06-01T09:12:00") },
  { id: 2, actor: "abena@gsl.edu.gh", action: "Export report", target: "Finance", status: "success", timestamp: new Date("2026-06-04T14:03:00") },
  { id: 3, actor: "kofi@gsl.edu.gh", action: "Failed login", target: "Portal", status: "failed", timestamp: new Date("2026-06-10T08:45:00") },
  { id: 4, actor: "esi@gsl.edu.gh", action: "Update permissions", target: "User: yaw@gsl.edu.gh", status: "warning", timestamp: new Date("2026-06-15T11:20:00") },
  { id: 5, actor: "yaw@gsl.edu.gh", action: "Delete record", target: "Claims", status: "warning", timestamp: new Date("2026-06-18T16:32:00") },
  { id: 6, actor: "nana@gsl.edu.gh", action: "Login", target: "Portal", status: "success", timestamp: new Date("2026-06-22T09:01:00") },
  { id: 7, actor: "akua@gsl.edu.gh", action: "Approve claim", target: "Claims", status: "success", timestamp: new Date("2026-06-25T13:47:00") },
  { id: 8, actor: "kwesi@gsl.edu.gh", action: "Failed login", target: "Portal", status: "failed", timestamp: new Date("2026-06-29T07:58:00") },
  { id: 9, actor: "adwoa@gsl.edu.gh", action: "Export report", target: "Finance", status: "success", timestamp: new Date("2026-07-02T10:15:00") },
  { id: 10, actor: "kobina@gsl.edu.gh", action: "Update permissions", target: "User: esi@gsl.edu.gh", status: "warning", timestamp: new Date("2026-07-06T15:40:00") },
];

function statusVariant(status: AuditLogEntry["status"]) {
  switch (status) {
    case "success":
      return "success" as const;
    case "failed":
      return "error" as const;
    case "warning":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const columns: TableColumn<AuditLogEntry>[] = [
  { id: "actor", header: "Actor", accessorKey: "actor", sortable: true },
  { id: "action", header: "Action", accessorKey: "action", sortable: true },
  { id: "target", header: "Target", accessorKey: "target" },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    cell: ({ value }) => (
      <Badge variant={statusVariant(value as AuditLogEntry["status"])}>
        {String(value)}
      </Badge>
    ),
  },
  {
    id: "timestamp",
    header: "Date",
    accessorFn: (row) => formatDate(row.timestamp),
    sortable: true,
  },
];

export function DateRangeFilterExample() {
  const { page, pageSize, pageSizeOptions, search } = useTableState({
    defaultPageSize: 5,
  });

  // Local draft state for the date range picker inside the filter popover.
  const [draftRange, setDraftRange] = useState<DateRangeValue>({
    start: null,
    end: null,
  });
  // Only committed to `appliedRange` when the user clicks "Apply".
  const [appliedRange, setAppliedRange] = useState<DateRangeValue>({
    start: null,
    end: null,
  });

  // Demo-only toggle to simulate a genuine error/permission failure, where we
  // render an inline message in place of the table body instead of letting
  // TableContent render its own (empty ≠ error) state.
  const [simulateError, setSimulateError] = useState(false);

  const filtered = auditLog.filter((entry) => {
    const matchesSearch =
      !search ||
      entry.actor.toLowerCase().includes(search.toLowerCase()) ||
      entry.action.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (appliedRange.start && entry.timestamp < appliedRange.start) return false;
    if (appliedRange.end && entry.timestamp > appliedRange.end) return false;

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Table paramPrefix="audit-log">
        <TableHeader>
          <TableSearch placeholder="Search audit log..." />
          <TableFilter
            applyLabel="Apply"
            onApply={() => setAppliedRange(draftRange)}
            onReset={() => {
              setDraftRange({ start: null, end: null });
              setAppliedRange({ start: null, end: null });
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>Date range</label>
              <DateRangeSelector
                value={draftRange}
                onChange={setDraftRange}
                placeholder="Select date range"
              />
            </div>
          </TableFilter>
        </TableHeader>

        {simulateError ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "40px 16px",
              textAlign: "center",
            }}
          >
            <ShieldAlert size={32} strokeWidth={1.5} color="var(--gsl-error)" />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--gsl-error-text)" }}>
              You don&apos;t have permission to view this audit log.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--gsl-text-muted)" }}>
              Contact an administrator if you believe this is a mistake.
            </p>
          </div>
        ) : (
          <TableContent
            columns={columns}
            data={paged}
            rowKey={(row) => row.id}
            emptyIcon={<SearchX size={40} strokeWidth={1} />}
            emptyText="No audit events in the selected range"
          />
        )}

        <TableFooter>
          <TablePagination
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSizeOptions={pageSizeOptions}
          />
        </TableFooter>
      </Table>

      <Button
        variant="outline"
        size="sm"
        style={{ alignSelf: "flex-start" }}
        onClick={() => setSimulateError((v) => !v)}
      >
        {simulateError ? "Show table" : "Simulate permission error"}
      </Button>
    </div>
  );
}
