import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { RouterAdapterValue } from "../types/router-adapter";

/**
 * Default router adapter backed by react-router-dom's `useSearchParams`
 * and `Link`. This is the standard adapter for Vite / react-router consumers.
 *
 * Injected into the registry by `src/index.ts`.
 */
export function useReactRouterAdapter(): RouterAdapterValue {
	const [searchParams, setSearchParams] = useSearchParams();

	return useMemo(
		() => ({
			searchParams,
			setSearchParams,
			Link,
		}),
		[searchParams, setSearchParams],
	);
}
