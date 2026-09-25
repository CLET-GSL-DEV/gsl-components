import { useMemo, useState } from "react";
import {
  Activity,
  Download,
  Eye,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  EmptyState,
  HeroBanner,
  MetricCard,
  MetricCards,
  PageSection,
  SectionActions,
  SectionDescription,
  SectionHeader,
  SectionTitle,
  Table,
  TableContent,
  TableFilter,
  TableFooter,
  TableHeader,
  TablePagination,
  TableSearch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useBreadcrumbs,
  useTableState,
} from "@rfdtech/components";
import type { TableColumn, TableRowAction } from "@rfdtech/components";
import { gslMembers } from "demo/data/demoHomeMembers";
import { useMockQuery } from "demo/hooks/useMockQuery";
import { VersionSwitcher } from "demo/components/VersionSwitcher";

interface SupportingDocument {
  id: string;
  name: string;
  type: string;
  uploaded: string;
  status: string;
}

const sampleDocuments: SupportingDocument[] = [
  {
    id: "doc-1",
    name: "Teaching Certificate",
    type: "PDF",
    uploaded: "12 Aug 2026",
    status: "Verified",
  },
  {
    id: "doc-2",
    name: "Staff Conduct Policy",
    type: "DOCX",
    uploaded: "28 Aug 2026",
    status: "Pending",
  },
  {
    id: "doc-3",
    name: "Staff Records Export",
    type: "CSV",
    uploaded: "02 Sep 2026",
    status: "Verified",
  },
];

function documentStatusVariant(status: string) {
  switch (status) {
    case "Verified":
      return "success" as const;
    case "Pending":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

const documentColumns: TableColumn<SupportingDocument>[] = [
  { id: "name", header: "Document", accessorKey: "name", sortable: true },
  { id: "type", header: "Type", accessorKey: "type", sortable: true },
  { id: "uploaded", header: "Uploaded", accessorKey: "uploaded", sortable: true },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    cell: ({ value }) => (
      <Badge variant={documentStatusVariant(String(value))}>
        {String(value)}
      </Badge>
    ),
  },
];

/**
 * 2.4 dashboard: hero banner, metric cards with footer adornments, and the
 * supporting-documents table composed exactly like the dash-3 members
 * table (search, filters, row actions, pagination, empty state).
 * New components live here — Dashboard3 stays frozen at 2.3.
 */
export function Dashboard4Page() {
  useBreadcrumbs([
    { label: "Home", href: "/" },
    { label: "Users", href: "/users/user-1" },
  ]);
  const { data: membersData, loading: metricsLoading } = useMockQuery(
    gslMembers,
    900,
    "dash4-members",
  );
  const members = membersData ?? [];

  const { page, pageSize, pageSizeOptions, search, filters } = useTableState({
    defaultPageSize: 10,
    paramPrefix: "dash4-documents",
  });
  const [typeValue, setTypeValue] = useState(filters.type ?? "");
  const [statusValue, setStatusValue] = useState(filters.status ?? "");
  const [documents, setDocuments] = useState<SupportingDocument[]>([]);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const hasDocuments = documents.length > 0;

  const filtered = useMemo(
    () =>
      documents.filter((doc) => {
        const matchSearch =
          doc.name.toLowerCase().includes(search.toLowerCase()) ||
          doc.type.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusValue || doc.status === statusValue;
        const matchType = !typeValue || doc.type === typeValue;
        return matchSearch && matchStatus && matchType;
      }),
    [documents, search, statusValue, typeValue],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const rowActions = useMemo<TableRowAction<SupportingDocument>[]>(
    () => [
      {
        id: "view",
        label: "View",
        icon: <Eye size={14} strokeWidth={1.5} />,
        onClick: (doc) => console.log("View:", doc.name),
      },
      {
        id: "download",
        label: "Download",
        icon: <Download size={14} strokeWidth={1.5} />,
        onClick: (doc) => console.log("Download:", doc.name),
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Trash2 size={14} strokeWidth={1.5} />,
        onClick: (doc) =>
          setDocuments((prev) => prev.filter((d) => d.id !== doc.id)),
        destructive: true,
      },
    ],
    [],
  );

  return (
    <>
      <PageSection>
        <SectionHeader>
          <SectionTitle>Supporting Documents</SectionTitle>
          <SectionDescription>
            Evidence attached to accreditation applications.
          </SectionDescription>
          <SectionActions>
            <VersionSwitcher active="v2_4" />
          <Button
            variant="primary"
            className="demo-docs-toggle"
            onClick={() =>
              setDocuments((current) =>
                current.length > 0 ? [] : sampleDocuments,
              )
            }
          >
            {hasDocuments ? "Clear documents" : "Load sample documents"}
          </Button>
          </SectionActions>
        </SectionHeader>
      </PageSection>

      <HeroBanner
        name="Kwame Asante"
        style={{ marginBottom: "var(--clet-app-layout-body-gap)" }}
      />

      <PageSection>
        <MetricCards>
          <MetricCard
            variant="soft"
            mark="adinkra-hene"
            loading={metricsLoading}
            label="Total Members"
            value={members.length}
            description="Across all departments"
            descriptionAdornment={
              <Users size={16} strokeWidth={2} color="#0c4a6e" aria-hidden />
            }
          />
          <MetricCard
            variant="soft"
            mark="nkyimu"
            loading={metricsLoading}
            label="Active Members"
            value={members.filter((m) => m.status === "Active").length}
            description="Currently active"
            descriptionAdornment={
              <UserCheck size={16} strokeWidth={2} color="#006229" aria-hidden />
            }
          />
          <MetricCard
            variant="soft"
            mark="mpuannum"
            loading={metricsLoading}
            label="New This Month"
            value={members.filter((m) => m.joined >= "2025-01-01").length}
            description="Joined this year"
            descriptionAdornment={
              <UserPlus size={16} strokeWidth={2} color="#b8960c" aria-hidden />
            }
          />
          <MetricCard
            variant="soft"
            mark="okodee-mmowere"
            loading={metricsLoading}
            label="Engagement Rate"
            value="94.2%"
            description="Average daily activity"
            descriptionAdornment={
              <Activity size={16} strokeWidth={2} color="#8a6914" aria-hidden />
            }
          />
        </MetricCards>
      </PageSection>

      <PageSection>
        <Tabs
          variant="pill"
          value={statusValue || "all"}
          onValueChange={(value) =>
            setStatusValue(value === "all" ? "" : value)
          }
        >
          <TabsList>
            <TabsTrigger value="all">All documents</TabsTrigger>
            <TabsTrigger value="Verified">Verified</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value={statusValue || "all"}>
            <Table paramPrefix="dash4-documents" variant="soft">
              <Card bordered>
                <TableHeader>
                  <TableSearch placeholder="Search documents..." />
                  <TableFilter variant="spread">
                    <Dropdown
                      name="type"
                      value={typeValue || null}
                      onValueChange={(v) => setTypeValue(v ?? "")}
                      options={[
                        { value: "PDF", label: "PDF" },
                        { value: "DOCX", label: "DOCX" },
                        { value: "CSV", label: "CSV" },
                      ]}
                      placeholder="All types"
                      aria-label="Filter by type"
                    />
                    <Dropdown
                      name="status"
                      value={statusValue || null}
                      onValueChange={(v) => setStatusValue(v ?? "")}
                      options={[
                        { value: "Verified", label: "Verified" },
                        { value: "Pending", label: "Pending" },
                      ]}
                      placeholder="All statuses"
                      aria-label="Filter by status"
                    />
                  </TableFilter>
                </TableHeader>
                <TableContent
                  variant="soft"
                  selectable
                  selectedIds={selected}
                  onSelectionChange={setSelected}
                  columns={documentColumns}
                  data={paged}
                  rowKey={(doc) => doc.id}
                  rowActions={rowActions}
                  emptyContent={
                    <EmptyState
                      title="No documents yet"
                      description="Add certificates, policies, staff records and other evidence CLET needs to assess applications."
                    />
                  }
                />
              </Card>
              <TableFooter noBorder>
                <TablePagination
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  pageSizeOptions={pageSizeOptions}
                />
              </TableFooter>
            </Table>
          </TabsContent>
        </Tabs>
      </PageSection>
    </>
  );
}
