import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTablePagination } from "./useTablePagination";

/* ── Types ── */

export type TableFilters = Record<string, string | null | undefined>;

export interface UseTableStateOptions<
  TFilters extends TableFilters = TableFilters,
> {
  /** Initial page (default 1) */
  defaultPage?: number;
  /** Initial page size (default 20) */
  defaultPageSize?: number;
  /** Initial search term */
  defaultSearch?: string;
  /** Initial filter values */
  defaultFilters?: Partial<TFilters>;
  /** Initial sort state */
  defaultSort?: { column: string; direction: "asc" | "desc" } | null;
  /**
   * Prefix for URL param keys. Use when multiple tables share the same page.
   * Example: `"members"` → `?members.page=1&members.search=...`
   */
  paramPrefix?: string;
}

export interface UseTableStateReturn<
  TFilters extends TableFilters = TableFilters,
> {
  /* Pagination */
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  /* Search */
  search: string;
  setSearch: (search: string) => void;
  /* Filters */
  filters: Partial<TFilters>;
  setFilters: (filters: Partial<TFilters>) => void;
  setFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
  /* Sort */
  sort: { column: string; direction: "asc" | "desc" } | null;
  setSort: (
    sort: { column: string; direction: "asc" | "desc" } | null,
  ) => void;
  /* Reset */
  resetAll: () => void;
}

/* ── Constants ── */

const FILTER_PREFIX = "f_";

/* ── Helpers ── */

function paramKey(prefix: string | undefined, key: string): string {
  return prefix ? `${prefix}.${key}` : key;
}

/* ── URL helpers ── */

function readFilters(
  params: URLSearchParams,
  prefix: string | undefined,
  defaults: Record<string, string> | undefined,
): Record<string, string> {
  const filterPrefix = paramKey(prefix, FILTER_PREFIX);
  const filters: Record<string, string> = { ...defaults };

  for (const [key, value] of params.entries()) {
    if (key.startsWith(filterPrefix)) {
      const filterKey = key.slice(filterPrefix.length);
      if (filterKey) {
        filters[filterKey] = value;
      }
    }
  }

  return filters;
}

function writeFilters(
  params: URLSearchParams,
  prefix: string | undefined,
  filters: Record<string, string | null | undefined>,
) {
  const filterPrefix = paramKey(prefix, FILTER_PREFIX);

  // Remove existing filter params
  for (const key of [...params.keys()]) {
    if (key.startsWith(filterPrefix)) {
      params.delete(key);
    }
  }

  // Set new filter values (skip null/undefined/empty)
  for (const [key, value] of Object.entries(filters)) {
    if (value != null && value !== "") {
      params.set(`${filterPrefix}${key}`, value);
    }
  }
}

/* ── Hook ── */

export function useTableState<
  TFilters extends TableFilters = TableFilters,
>(
  options: UseTableStateOptions<TFilters> = {},
): UseTableStateReturn<TFilters> {
  const {
    defaultPage = 1,
    defaultPageSize = 20,
    defaultSearch = "",
    defaultFilters,
    defaultSort = null,
    paramPrefix,
  } = options;

  const searchKey = paramKey(paramPrefix, "search");
  const sortKey = paramKey(paramPrefix, "sort");
  const dirKey = paramKey(paramPrefix, "direction");

  // Compose pagination from the shared hook
  const { page, pageSize, setPage, setPageSize, reset: resetPagination } =
    useTablePagination({ defaultPage, defaultPageSize, paramPrefix });

  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get(searchKey) ?? defaultSearch;

  const filters = readFilters(
    searchParams,
    paramPrefix,
    defaultFilters as Record<string, string> | undefined,
  ) as Partial<TFilters>;

  const sortColumn = searchParams.get(sortKey);
  const sortDir = searchParams.get(dirKey) as "asc" | "desc" | null;
  const sort: { column: string; direction: "asc" | "desc" } | null =
    sortColumn && (sortDir === "asc" || sortDir === "desc")
      ? { column: sortColumn, direction: sortDir }
      : defaultSort;

  /* ── Setters ── */

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) {
            next.set(searchKey, value);
          } else {
            next.delete(searchKey);
          }
          // Reset to first page on search
          next.set(paramKey(paramPrefix, "page"), String(defaultPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, searchKey, paramPrefix, defaultPage],
  );

  const setFilters = useCallback(
    (nextFilters: Partial<TFilters>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          writeFilters(
            next,
            paramPrefix,
            nextFilters as Record<string, string | null | undefined>,
          );
          next.set(paramKey(paramPrefix, "page"), String(defaultPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, paramPrefix, defaultPage],
  );

  const setFilter = useCallback(
    <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const filterPrefix = paramKey(paramPrefix, FILTER_PREFIX);
          const fullKey = `${filterPrefix}${String(key)}`;

          if (value != null && value !== "") {
            next.set(fullKey, String(value));
          } else {
            next.delete(fullKey);
          }

          next.set(paramKey(paramPrefix, "page"), String(defaultPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, paramPrefix, defaultPage],
  );

  const setSort = useCallback(
    (
      nextSort: { column: string; direction: "asc" | "desc" } | null,
    ) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextSort) {
            next.set(sortKey, nextSort.column);
            next.set(dirKey, nextSort.direction);
          } else {
            next.delete(sortKey);
            next.delete(dirKey);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, sortKey, dirKey],
  );

  const resetAll = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const key of [...next.keys()]) {
          if (paramPrefix ? key.startsWith(`${paramPrefix}.`) : true) {
            next.delete(key);
          }
        }
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams, paramPrefix]);

  return useMemo(
    () => ({
      page,
      pageSize,
      setPage,
      setPageSize,
      search,
      setSearch,
      filters,
      setFilters,
      setFilter,
      sort,
      setSort,
      resetAll,
    }),
    [
      page,
      pageSize,
      setPage,
      setPageSize,
      search,
      setSearch,
      filters,
      setFilters,
      setFilter,
      sort,
      setSort,
      resetAll,
    ],
  );
}
