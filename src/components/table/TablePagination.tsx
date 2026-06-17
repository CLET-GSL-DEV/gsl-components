import { forwardRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "../select/Select";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import { useTableContext } from "./TableContext";
import type { PaginationControlsProps } from "../../types/table";
import "./styles/table.css";

/* ── Helpers ── */

function paramKey(prefix: string | undefined, key: string): string {
  return prefix ? `${prefix}.${key}` : key;
}

function readInt(
  params: URLSearchParams,
  key: string,
  fallback: number,
): number {
  const raw = params.get(key);
  if (raw == null) return fallback;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? fallback : n;
}

/* ── Pagination helpers ── */

function getPageNumbers(
  current: number,
  total: number,
  maxVisible: number,
): (number | "ellipsis")[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const nearStart = current <= Math.floor(maxVisible / 2) + 1;
  const nearEnd = current >= total - Math.floor(maxVisible / 2) - 1;

  let middleSize: number;
  let start: number;
  let hasLeftEllipsis = false;
  let hasRightEllipsis = false;

  if (nearStart) {
    middleSize = maxVisible - 2;
    start = 1;
    hasRightEllipsis = true;
  } else if (nearEnd) {
    middleSize = maxVisible - 2;
    start = total - middleSize + 1;
    hasLeftEllipsis = true;
  } else {
    middleSize = Math.max(1, maxVisible - 4);
    const half = Math.floor(middleSize / 2);
    start = current - half;
    hasLeftEllipsis = true;
    hasRightEllipsis = true;
  }

  const pages: (number | "ellipsis")[] = [];

  if (start > 1) {
    pages.push(1);
    if (hasLeftEllipsis) pages.push("ellipsis" as const);
  }

  for (let i = start; i < start + middleSize && i <= total; i++) {
    pages.push(i);
  }

  const end = start + middleSize - 1;
  if (end < total) {
    if (hasRightEllipsis) pages.push("ellipsis" as const);
    pages.push(total);
  }

  return pages;
}

/* ── Pagination ── */

export const TablePagination = forwardRef<
  HTMLDivElement,
  PaginationControlsProps
>(function TablePagination(
  {
    totalPages,
    totalItems,
    pageSizeOptions = [10, 20, 50, 100],
    visiblePages = 10,
    className,
  },
  ref,
) {
  const { paramPrefix } = useTableContext();
  const pageKey = paramKey(paramPrefix, "page");
  const sizeKey = paramKey(paramPrefix, "pageSize");

  const [searchParams, setSearchParams] = useSearchParams();

  const page = readInt(searchParams, pageKey, 1);
  const pageSize = readInt(searchParams, sizeKey, 10);

  const setPage = useCallback(
    (p: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(pageKey, String(p));
          return next;
        },
        { replace: false },
      );
    },
    [setSearchParams, pageKey],
  );

  const setPageSize = useCallback(
    (ps: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(sizeKey, String(ps));
          next.set(pageKey, "1");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, sizeKey, pageKey],
  );

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const start = totalItems ? (page - 1) * pageSize + 1 : null;
  const end = totalItems ? Math.min(page * pageSize, totalItems) : null;
  const pageNumbers = getPageNumbers(page, totalPages, visiblePages);

  return (
    <div ref={ref} className={cn("gsl-table__pagination", className)}>
      {totalItems != null && (
        <span className="gsl-table__page-results">
          Show{" "}
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
            options={pageSizeOptions.map((s) => ({
              value: String(s),
              label: String(s),
            }))}
          />{" "}
          of {totalItems}
        </span>
      )}

      <div className="gsl-table__pagination-pages">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canPrev}
          onClick={() => setPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} strokeWidth={1.5} aria-hidden />
          Previous
        </Button>

        {pageNumbers.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="gsl-table__page-ellipsis">
              &hellip;
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPage(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="ghost"
          size="sm"
          disabled={!canNext}
          onClick={() => setPage(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={14} strokeWidth={1.5} aria-hidden />
        </Button>
      </div>
    </div>
  );
});
