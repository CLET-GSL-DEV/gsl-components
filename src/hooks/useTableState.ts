import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/* ── Types ── */

export type TableFilters = Record<string, string | null | undefined>;

export interface UseTableStateOptions<
  TFilters extends TableFilters = TableFilters,
> {
  defaultPage?: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  defaultSearch?: string;
  defaultFilters?: Partial<TFilters>;
  defaultSort?: { column: string; direction: "asc" | "desc" } | null;
  paramPrefix?: string;
}

export interface UseTableStateReturn<
  TFilters extends TableFilters = TableFilters,
> {
  page: number;
  pageSize: number;
  pageSizeOptions: number[];
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  search: string;
  setSearch: (search: string) => void;
  filters: Partial<TFilters>;
  setFilters: (filters: Partial<TFilters>) => void;
  setFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
  sort: { column: string; direction: "asc" | "desc" } | null;
  setSort: (sort: { column: string; direction: "asc" | "desc" } | null) => void;
  resetAll: () => void;
}

/* ── Constants ── */

const FILTER_PREFIX = "f_";

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
  for (const key of [...params.keys()]) {
    if (key.startsWith(filterPrefix)) {
      params.delete(key);
    }
  }
  for (const [key, value] of Object.entries(filters)) {
    if (value != null && value !== "") {
      params.set(`${filterPrefix}${key}`, value);
    }
  }
}

/* ── Hook ── */

export function useTableState<TFilters extends TableFilters = TableFilters>(
  options: UseTableStateOptions<TFilters> = {},
): UseTableStateReturn<TFilters> {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    defaultSearch = "",
    defaultFilters,
    defaultSort = null,
    paramPrefix,
  } = options;

  const pageKey = paramKey(paramPrefix, "page");
  const sizeKey = paramKey(paramPrefix, "pageSize");
  const searchKey = paramKey(paramPrefix, "search");
  const sortKey = paramKey(paramPrefix, "sort");
  const dirKey = paramKey(paramPrefix, "direction");

  // SINGLE useSearchParams call — all state derived from it
  const [searchParams, setSearchParams] = useSearchParams();

  const page = readInt(searchParams, pageKey, defaultPage);
  const pageSize = readInt(searchParams, sizeKey, defaultPageSize);
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
          next.set(pageKey, String(defaultPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, sizeKey, pageKey, defaultPage],
  );

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
          next.set(pageKey, String(defaultPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, searchKey, pageKey, defaultPage],
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
          next.set(pageKey, String(defaultPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, paramPrefix, pageKey, defaultPage],
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

          next.set(pageKey, String(defaultPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, paramPrefix, pageKey, defaultPage],
  );

  const setSort = useCallback(
    (nextSort: { column: string; direction: "asc" | "desc" } | null) => {
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
      pageSizeOptions,
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
      pageSizeOptions,
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
