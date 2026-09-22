import { useContext } from "react";
import { RouterAdapterContext } from "../contexts/router-adapter-context";
import type { RouterAdapterValue } from "../types/router-adapter";

let inject: (() => RouterAdapterValue) | null = null;

/**
 * Inject the router adapter factory. Called once by the entry point
 * (`src/index.ts` or `src/next-index.ts`) at module load time.
 *
 * - Default entry injects `useReactRouterAdapter` (react-router-dom)
 * - Next.js entry injects `useContextRouterAdapter` (context-only)
 */
export function setRouterAdapter(fn: () => RouterAdapterValue): void {
	inject = fn;
}

/**
 * Called by every hook/component that needs router primitives.
 * Returns the search params + Link component for the current framework.
 *
 * This MUST be called at the top of a hook or component function
 * (like any hook) — the returned adapter function internally
 * calls hooks.
 */
export function getRouterAdapter(): RouterAdapterValue {
	// A custom provider wins when present, keeping the default entry compatible.
	// Must stay unconditional: getRouterAdapter is called as a hook.
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const ctx = useContext(RouterAdapterContext);
	if (ctx) {
		return ctx;
	}
	if (!inject) {
		throw new Error(
			"RouterAdapter not configured. " +
				"Ensure you import from the correct entry point and have " +
				"the required peer dependency installed.\n" +
				"  react-router-dom: import from '@rfdtech/components'\n" +
				"  Next.js:         import from '@rfdtech/components/next'",
		);
	}
	return inject();
}
