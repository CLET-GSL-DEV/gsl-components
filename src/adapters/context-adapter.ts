import { useContext } from "react";
import { RouterAdapterContext } from "../contexts/router-adapter-context";
import type { RouterAdapterValue } from "../types/router-adapter";

/**
 * Router adapter that reads from `RouterAdapterContext` only.
 * Throws if no provider is present.
 *
 * This adapter has zero dependency on `react-router-dom`.
 * It is used by the `@rfdtech/components/next` entry point.
 *
 * Consumers must wrap their app in `<RouterAdapterProvider>`:
 *
 * ```tsx
 * <RouterAdapterProvider value={adapter}>
 *   <App />
 * </RouterAdapterProvider>
 * ```
 */
export function useContextRouterAdapter(): RouterAdapterValue {
	const ctx = useContext(RouterAdapterContext);

	if (!ctx) {
		throw new Error(
			"No RouterAdapter found in context. " +
				"Wrap your app in <RouterAdapterProvider> when using " +
				"'@rfdtech/components/next'.",
		);
	}

	return ctx;
}
