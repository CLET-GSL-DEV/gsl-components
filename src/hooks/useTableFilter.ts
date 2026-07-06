import { useCallback, useMemo } from "react";
import { getRouterAdapter } from "../adapters/registry";

/* ── Types ── */

export type TableFilters = Record<string, string | null | undefined>;

export interface UseTableFilterOptions {
	/** Default filter values */
	defaults?: Record<string, string>;
	/** URL key namespace (must match any parent Table paramPrefix) */
	paramPrefix?: string;
}

export interface UseTableFilterReturn {
	/** Current filter values */
	filters: Record<string, string>;
	/** Replace all filters */
	setFilters: (filters: Record<string, string | null | undefined>) => void;
	/** Set or clear a single filter */
	setFilter: (key: string, value: string | null | undefined) => void;
	/** Clear all filters */
	resetFilters: () => void;
}

/* ── Constants ── */

const FILTER_PREFIX = "f_";

/* ── Helpers ── */

function paramKey(prefix: string | undefined, key: string): string {
	return prefix ? `${prefix}.${key}` : key;
}

function readFilters(
	params: URLSearchParams,
	prefix: string | undefined,
	defaults: Record<string, string> = {},
): Record<string, string> {
	const filterPrefix = paramKey(prefix, FILTER_PREFIX);
	const result: Record<string, string> = { ...defaults };

	for (const [key, value] of params.entries()) {
		if (key.startsWith(filterPrefix)) {
			const filterKey = key.slice(filterPrefix.length);
			if (filterKey) {
				result[filterKey] = value;
			}
		}
	}

	return result;
}

/* ── Hook ── */

export function useTableFilter(
	options: UseTableFilterOptions = {},
): UseTableFilterReturn {
	const { defaults, paramPrefix } = options;

	const { searchParams, setSearchParams } = getRouterAdapter();

	const filters = useMemo(
		() => readFilters(searchParams, paramPrefix, defaults),
		[searchParams, paramPrefix, defaults],
	);

	const setFilters = useCallback(
		(nextFilters: Record<string, string | null | undefined>) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					const filterPrefix = paramKey(paramPrefix, FILTER_PREFIX);

					// Remove existing filter keys
					for (const key of [...next.keys()]) {
						if (key.startsWith(filterPrefix)) {
							next.delete(key);
						}
					}

					// Set new filter values
					for (const [key, value] of Object.entries(nextFilters)) {
						if (value != null && value !== "") {
							next.set(`${filterPrefix}${key}`, value);
						}
					}

					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams, paramPrefix],
	);

	const setFilter = useCallback(
		(key: string, value: string | null | undefined) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					const filterPrefix = paramKey(paramPrefix, FILTER_PREFIX);
					const fullKey = `${filterPrefix}${key}`;

					if (value != null && value !== "") {
						next.set(fullKey, String(value));
					} else {
						next.delete(fullKey);
					}

					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams, paramPrefix],
	);

	const resetFilters = useCallback(() => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				const filterPrefix = paramKey(paramPrefix, FILTER_PREFIX);

				for (const key of [...next.keys()]) {
					if (key.startsWith(filterPrefix)) {
						next.delete(key);
					}
				}

				return next;
			},
			{ replace: true },
		);
	}, [setSearchParams, paramPrefix]);

	return useMemo(
		() => ({ filters, setFilters, setFilter, resetFilters }),
		[filters, setFilters, setFilter, resetFilters],
	);
}
