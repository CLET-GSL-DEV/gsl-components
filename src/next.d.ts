// Type definitions for @rfdtech/components/next
// Re-exports every export from the main entry, plus Next.js-specific hooks.

import type { RouterAdapterValue } from "./types/router-adapter";

export * from "./index";

export { RouterAdapterProvider } from "./contexts/router-adapter-context";

/**
 * Creates a `RouterAdapterValue` for Next.js App Router.
 * Wraps `next/navigation` hooks (`useSearchParams`, `useRouter`, `usePathname`)
 * and `next/link`.
 *
 * Consumers import this hook and pass the result to `<RouterAdapterProvider>`:
 *
 * ```tsx
 * "use client";
 * import { RouterAdapterProvider, useNextRouterAdapter } from "@rfdtech/components/next";
 *
 * export function Providers({ children }) {
 *   const adapter = useNextRouterAdapter();
 *   return <RouterAdapterProvider value={adapter}>{children}</RouterAdapterProvider>;
 * }
 * ```
 *
 * Requires `next` >= 14.0.0 to be installed.
 */
export declare function useNextRouterAdapter(): RouterAdapterValue;
