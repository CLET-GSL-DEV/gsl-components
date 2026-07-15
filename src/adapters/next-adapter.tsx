import { useCallback, useMemo } from "react";
// Import available only when `next` is installed (optional peer dependency).
// Uses @ts-ignore rather than @ts-expect-error: whether this errors depends on
// whether `next`'s types happen to resolve in the current node_modules layout
// (varies across npm/pnpm and across consumers), and @ts-expect-error fails
// the build the moment that flips to "resolves fine, no error to suppress".
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- see note above: @ts-ignore is deliberate here
// @ts-ignore
import { useRouter, useSearchParams, usePathname } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- see note above: @ts-ignore is deliberate here
// @ts-ignore
import NextLink from "next/link";
import type {
	RouterAdapterValue,
	RouterLinkProps,
} from "../types/router-adapter";

/**
 * Wraps `next/link` to accept `to` (the adapter's interface) as an alias
 * for `href` (Next.js's native prop).
 */
function AdapterLink({ to, ...rest }: RouterLinkProps) {
	return <NextLink href={to} {...rest} />;
}

/**
 * Create a `RouterAdapterValue` for Next.js App Router.
 *
 * Consumers import this hook and pass the result to `<RouterAdapterProvider>`:
 *
 * ```tsx
 * // app/providers.tsx
 * 'use client';
 * import { RouterAdapterProvider, useNextRouterAdapter } from '@rfdtech/components/next';
 *
 * export function Providers({ children }) {
 *   const adapter = useNextRouterAdapter();
 *   return (
 *     <RouterAdapterProvider value={adapter}>
 *       {children}
 *     </RouterAdapterProvider>
 *   );
 * }
 * ```
 */
export function useNextRouterAdapter(): RouterAdapterValue {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// During static rendering useSearchParams may be null
	const safeSearchParams = useMemo(
		() =>
			new URLSearchParams((searchParams ?? new URLSearchParams()).toString()),
		[searchParams],
	);

	const setSearchParams = useCallback(
		(
			next: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
			options?: { replace?: boolean },
		) => {
			let result: URLSearchParams;

			if (typeof next === "function") {
				const current = new URLSearchParams(safeSearchParams.toString());
				result = next(current);
			} else {
				result = next;
			}

			const qs = result.toString();
			const url = qs ? `${pathname}?${qs}` : pathname;

			if (options?.replace) {
				router.replace(url, { scroll: false });
			} else {
				router.push(url, { scroll: false });
			}
		},
		[safeSearchParams, router, pathname],
	);

	return useMemo(
		() => ({
			searchParams: safeSearchParams,
			setSearchParams,
			Link: AdapterLink,
		}),
		[safeSearchParams, setSearchParams],
	);
}
