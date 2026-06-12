import { DataTable } from "@rfdtech/components";
import { staffColumns, staffData } from "./shared";

export function DataTablePreview() {
  return (
    <DataTable
      columns={staffColumns}
      data={staffData}
      className="demo-data-table"
      pageSize={5}
    />
  );
}
