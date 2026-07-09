import { useCallback, useMemo } from "react";
import { getRouterAdapter } from "../adapters/registry";

/* ── Types ── */

export interface UseTablePaginationOptions {
	/** Initial page (default 1) */
	defaultPage?: number;
	/** Initial page size (default 10) */
	defaultPageSize?: number;
	/**
	 * Prefix for URL param keys. Use when multiple tables share the same page.
	 * Example: `"members"` → `?members.page=1&members.pageSize=10`
	 */
	paramPrefix?: string;
}

export interface UseTablePaginationReturn {
	page: number;
	pageSize: number;
	setPage: (page: number) => void;
	setPageSize: (pageSize: number) => void;
	reset: () => void;
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

export function useTablePagination(
	options: UseTablePaginationOptions = {},
): UseTablePaginationReturn {
	const { defaultPage = 1, defaultPageSize = 10, paramPrefix } = options;
	const pageKey = paramKey(paramPrefix, "page");
	const sizeKey = paramKey(paramPrefix, "pageSize");

	const { searchParams, setSearchParams } = getRouterAdapter();

	const page = readInt(searchParams, pageKey, defaultPage);
	const pageSize = readInt(searchParams, sizeKey, defaultPageSize);

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

	const reset = useCallback(() => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.delete(pageKey);
				next.delete(sizeKey);
				return next;
			},
			{ replace: true },
		);
	}, [setSearchParams, pageKey, sizeKey]);

	return useMemo(
		() => ({ page, pageSize, setPage, setPageSize, reset }),
		[page, pageSize, setPage, setPageSize, reset],
	);
}
