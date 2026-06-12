import type { KeyboardEvent } from "react";
import type { DataTableProps } from "../../types/data-table";
import { Pagination } from "../pagination/Pagination";
import { useDataTable } from "./hooks/useDataTable";
import "../../styles/theme.css";
import "./styles/data-table.css";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  getRowId,
  pageSize: initialPageSize = 10,
  pageSizeOptions,
  emptyText = "No results found.",
  loadingLabel = "Loading data",
  onRowClick,
  className,
  style,
}: DataTableProps<T>) {
  const table = useDataTable({
    columns,
    data,
    initialPageSize,
  });

  const columnCount = columns.length;

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (!onRowClick) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={columnCount}>
            <div className="gsl-data-table__loading">
              <span
                role="status"
                aria-label={loadingLabel}
                className="gsl-data-table__spinner"
              />
            </div>
          </td>
        </tr>
      );
    }

    if (table.rows.length === 0) {
      return (
        <tr>
          <td colSpan={columnCount}>
            <div className="gsl-data-table__empty">{emptyText}</div>
          </td>
        </tr>
      );
    }

    return table.rows.map((row, index) => {
      const rowId = getRowId?.(row, index) ?? index;
      const isClickable = Boolean(onRowClick);

      return (
        <tr
          key={rowId}
          className={isClickable ? "gsl-data-table__row--clickable" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onClick={isClickable ? () => onRowClick?.(row) : undefined}
          onKeyDown={
            isClickable ? (event) => handleRowKeyDown(event, row) : undefined
          }
        >
          {columns.map((column) => {
            const value = row[column.key];
            return (
              <td
                key={column.key}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.render?.(row, value) ?? String(value ?? "")}
              </td>
            );
          })}
        </tr>
      );
    });
  };

  return (
    <div
      className={["gsl-data-table", className].filter(Boolean).join(" ")}
      style={style}
    >
      <div className="gsl-data-table__table-wrap">
        <table className="gsl-data-table__table">
          <thead>
            <tr>
              {columns.map((column) => {
                const isSorted = table.sort?.key === column.key;
                const ariaSort = isSorted
                  ? table.sort?.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : column.sortable
                    ? "none"
                    : undefined;

                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="gsl-data-table__header-button"
                        disabled={loading}
                        onClick={() => table.toggleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        <span className="gsl-data-table__sort-indicator" aria-hidden="true">
                          {isSorted
                            ? table.sort?.direction === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>

      <Pagination
        page={table.page}
        pageSize={table.pageSize}
        total={table.total}
        pageSizeOptions={pageSizeOptions}
        loading={loading}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
      />
    </div>
  );
}
