import { useMemo } from "react";
import type { PaginationProps } from "../../types/pagination";
import { Dropdown } from "../dropdown/Dropdown";
import { getPageCount, getPageRange } from "./utils";
import "../../styles/theme.css";
import "./styles/pagination.css";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

export function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  loading = false,
  emptySummaryText = "Showing 0 results",
  onPageChange,
  onPageSizeChange,
  className,
  style,
}: PaginationProps) {
  const pageCount = getPageCount(total, pageSize);
  const { start, end } = getPageRange(page, pageSize, total);
  const pageSizeDropdownOptions = useMemo(() => {
    const options = new Set(pageSizeOptions);
    options.add(pageSize);

    return [...options]
      .sort((left, right) => left - right)
      .map((option) => ({
        value: String(option),
        label: String(option),
      }));
  }, [pageSize, pageSizeOptions]);

  return (
    <div
      className={["gsl-pagination", className].filter(Boolean).join(" ")}
      style={style}
    >
      <div className="gsl-pagination__meta">
        <span className="gsl-pagination__summary">
          {total === 0
            ? emptySummaryText
            : `Showing ${start}–${end} of ${total}`}
        </span>
        <div className="gsl-pagination__page-size">
          <span>Rows per page</span>
          <Dropdown
            ariaLabel="Rows per page"
            value={String(pageSize)}
            options={pageSizeDropdownOptions}
            disabled={loading}
            onChange={(value) => {
              if (value) {
                onPageSizeChange(Number(value));
              }
            }}
            className="gsl-pagination__page-size-dropdown"
          />
        </div>
      </div>

      <div className="gsl-pagination__controls">
        <button
          type="button"
          className="gsl-pagination__button"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="gsl-pagination__page-indicator">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          className="gsl-pagination__button"
          disabled={page >= pageCount || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
