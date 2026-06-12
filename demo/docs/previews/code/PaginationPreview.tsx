import { useState } from "react";
import { Pagination } from "@rfdtech/components";
import { staffData } from "./shared";

export function PaginationPreview() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      total={staffData.length}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
    />
  );
}
