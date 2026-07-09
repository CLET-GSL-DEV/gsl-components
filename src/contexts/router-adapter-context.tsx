import { createContext, type ReactNode } from "react";
import type { RouterAdapterValue } from "../types/router-adapter";

/**
 * React context holding the current `RouterAdapterValue`.
 * Populated by `<RouterAdapterProvider>`.
 *
 * When no provider is present, the default entry point
 * (`src/index.ts`) uses `useReactRouterAdapter` directly
 * (react-router-dom) — it does NOT read from this context.
 *
 * The Next.js entry (`src/next-index.ts`) REQUIRES a provider.
 */
export const RouterAdapterContext = createContext<RouterAdapterValue | null>(
	null,
);

/**
 * Provider to inject a custom router adapter.
 *
 * ```tsx
 * <RouterAdapterProvider value={adapter}>
 *   <App />
 * </RouterAdapterProvider>
 * ```
 */
export function RouterAdapterProvider({
	value,
	children,
}: {
	value: RouterAdapterValue;
	children: ReactNode;
}) {
	return (
		<RouterAdapterContext.Provider value={value}>
			{children}
		</RouterAdapterContext.Provider>
	);
}
