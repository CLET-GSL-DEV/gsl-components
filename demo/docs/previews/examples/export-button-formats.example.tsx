import { ExportButton } from "@rfdtech/components";
import type { ExportColumn } from "@rfdtech/components";

interface Member {
  name: string;
  email: string;
}

const members: Member[] = [
  { name: "Kwame Asante", email: "kwame.asante@clet.edu.gh" },
  { name: "Abena Mensah", email: "abena.mensah@clet.edu.gh" },
];

const columns: ExportColumn<Member>[] = [
  { header: "Name", accessor: (row) => row.name },
  { header: "Email", accessor: (row) => row.email },
];

export function ExportButtonFormatsExample() {
  return (
    <ExportButton
      data={members}
      columns={columns}
      title="Members"
      formats={["csv"]}
      label="Export CSV"
      variant="secondary"
    />
  );
}
