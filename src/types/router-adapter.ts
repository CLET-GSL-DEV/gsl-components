import type { ComponentType, ReactNode } from "react";

/**
 * URL search params adapater returned by `useRouterAdapter()`.
 * Hooks and components use this instead of calling `useSearchParams` directly.
 *
 * The default implementation wraps react-router-dom.
 * For Next.js, consumers provide a Next.js adapter via `RouterAdapterProvider`.
 */
export interface RouterSearchParams {
	/** Current URL search params. Reactive — changes trigger re-renders. */
	searchParams: URLSearchParams;
	/**
	 * Update URL search params. Accepts either a fully-constructed
	 * `URLSearchParams` or a function that receives the current params.
	 */
	setSearchParams: (
		next: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
		options?: { replace?: boolean },
	) => void;
	/**
	 * Subscribe to external param changes (e.g. browser back/forward).
	 * Only needed by hooks using `useSyncExternalStore`.
	 */
	subscribe?: (onStoreChange: () => void) => () => void;
}

/**
 * Props accepted by the Link component in the router adapter.
 */
export interface RouterLinkProps {
	to: string;
	className?: string;
	children?: ReactNode;
	onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
	[key: string]: unknown;
}

export type RouterLinkComponent = ComponentType<RouterLinkProps>;

/**
 * Everything a consuming hook/component needs from the host router:
 * search params + link rendering.
 */
export interface RouterAdapterValue {
	searchParams: URLSearchParams;
	setSearchParams: RouterSearchParams["setSearchParams"];
	subscribe?: RouterSearchParams["subscribe"];
	Link: RouterLinkComponent;
}
