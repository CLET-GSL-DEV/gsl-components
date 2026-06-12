import type { DataTableColumn, DataTableSort } from "../../../types/data-table";

function getCellText<T extends Record<string, unknown>>(
  row: T,
  column: DataTableColumn<T>,
): string {
  const value = row[column.key];
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  sort: DataTableSort | null,
  columns: DataTableColumn<T>[],
): T[] {
  if (!sort) {
    return rows;
  }

  const column = columns.find((entry) => entry.key === sort.key);
  if (!column) {
    return rows;
  }

  const direction = sort.direction === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    const leftValue = getCellText(left, column);
    const rightValue = getCellText(right, column);
    return leftValue.localeCompare(rightValue, undefined, {
      numeric: true,
      sensitivity: "base",
    }) * direction;
  });
}

export function paginateRows<T>(
  rows: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}
