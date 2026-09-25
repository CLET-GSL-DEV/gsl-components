import { useCallback, useMemo } from "react";
import { getRouterAdapter } from "../adapters/registry";

export type UseTabsStateReturn = readonly [
  value: string | undefined,
  onValueChange: (value: string) => void,
];

/**
 * URL-backed tab state, shaped exactly like `useState`: the value reads from
 * a search param and updates write it back, so the active tab survives
 * reloads, restores from shared links, and follows browser back/forward.
 * Wire it straight into `Tabs`:
 *
 * ```tsx
 * const [tab, setTab] = useTabsState("tab", "all");
 * <Tabs value={tab} onValueChange={setTab}>…</Tabs>
 * ```
 *
 * Selecting `defaultValue` removes the param, keeping shared URLs clean.
 * Give every tab set on the page its own `paramKey`. `Tabs` itself is
 * untouched: without this hook it behaves exactly as before, which is what
 * modals, forms, and docs previews want.
 */
export function useTabsState(
  paramKey: string,
  defaultValue?: string,
): UseTabsStateReturn {
  const { searchParams, setSearchParams } = getRouterAdapter();

  const value = searchParams.get(paramKey) ?? defaultValue;

  const onValueChange = useCallback(
    (next: string) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (defaultValue !== undefined && next === defaultValue) {
            params.delete(paramKey);
          } else {
            params.set(paramKey, next);
          }
          return params;
        },
        { replace: false },
      );
    },
    [setSearchParams, paramKey, defaultValue],
  );

  return useMemo(
    () => [value, onValueChange] as const,
    [value, onValueChange],
  );
}
