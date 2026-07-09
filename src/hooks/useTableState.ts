import { useCallback, useMemo } from "react";
import { getRouterAdapter } from "../adapters/registry";
import { useTableFilter } from "./useTableFilter";

// Re-export from useTableFilter for convenience
export type {
	UseTableFilterOptions,
	UseTableFilterReturn,
} from "./useTableFilter";
export { useTableFilter } from "./useTableFilter";

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

	const { searchParams, setSearchParams } = getRouterAdapter();

	const page = readInt(searchParams, pageKey, defaultPage);
	const pageSize = readInt(searchParams, sizeKey, defaultPageSize);
	const search = searchParams.get(searchKey) ?? defaultSearch;

	// ── Composed: filter read state from useTableFilter ──
	const { filters } = useTableFilter({
		defaults: defaultFilters as Record<string, string> | undefined,
		paramPrefix,
	});

	const sortColumn = searchParams.get(sortKey);
	const sortDir = searchParams.get(dirKey) as "asc" | "desc" | null;
	const sort: { column: string; direction: "asc" | "desc" } | null = useMemo(
		() =>
			sortColumn && (sortDir === "asc" || sortDir === "desc")
				? { column: sortColumn, direction: sortDir }
				: defaultSort,
		[sortColumn, sortDir, defaultSort],
	);

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
					// Manually apply filter writes using the same key pattern
					const filterPrefix = paramKey(paramPrefix, "f_");
					for (const key of [...next.keys()]) {
						if (key.startsWith(filterPrefix)) {
							next.delete(key);
						}
					}
					for (const [key, value] of Object.entries(
						nextFilters as Record<string, string | null | undefined>,
					)) {
						if (value != null && value !== "") {
							next.set(`${filterPrefix}${key}`, value);
						}
					}
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
					const filterPrefix = paramKey(paramPrefix, "f_");
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
			filters: filters as Partial<TFilters>,
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
