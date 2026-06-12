import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DataTableSort,
  UseDataTableOptions,
  UseDataTableReturn,
} from "../../../types/data-table";
import { getPageCount } from "../../pagination/utils";
import { paginateRows, sortRows } from "../utils/dataTableClient";

export function useDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  initialPageSize = 10,
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [sort, setSort] = useState<DataTableSort | null>(null);

  useEffect(() => {
    setPage(1);
  }, [pageSize, sort]);

  const { rows, total } = useMemo(() => {
    const sorted = sortRows(data, sort, columns);
    return {
      rows: paginateRows(sorted, page, pageSize),
      total: data.length,
    };
  }, [columns, data, page, pageSize, sort]);

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
  }, []);

  const toggleSort = useCallback((columnKey: string) => {
    setSort((current) => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key: columnKey, direction: "desc" };
      }

      return null;
    });
  }, []);

  const pageCount = getPageCount(total, pageSize);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return {
    rows,
    total,
    page,
    pageSize,
    sort,
    setPage,
    setPageSize,
    toggleSort,
  };
}
