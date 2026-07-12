import { ExportButton } from "@rfdtech/components";
import type { ExportColumn } from "@rfdtech/components";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

const members: Member[] = [
  { id: 1, name: "Kwame Asante", email: "kwame.asante@gsl.edu.gh", role: "Admin", status: "Active", joined: "2024-01-15" },
  { id: 2, name: "Abena Mensah", email: "abena.mensah@gsl.edu.gh", role: "Editor", status: "Active", joined: "2024-02-03" },
  { id: 3, name: "Kofi Owusu", email: "kofi.owusu@gsl.edu.gh", role: "Viewer", status: "Inactive", joined: "2024-03-08" },
];

const columns: ExportColumn<Member>[] = [
  { header: "Name", accessor: (row) => row.name },
  { header: "Email", accessor: (row) => row.email },
  { header: "Role", accessor: (row) => row.role },
  { header: "Status", accessor: (row) => row.status },
  { header: "Joined", accessor: (row) => row.joined },
];

export function ExportButtonExample() {
  return (
    <ExportButton
      data={members}
      columns={columns}
      title="Members"
      filtersDescription="Active only"
    />
  );
}
