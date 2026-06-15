import type { SearchParamAdapter } from "../types/search-param-overlay";

export interface CreateSearchParamAdapterOptions {
  get: () => URLSearchParams;
  set: (
    params: URLSearchParams,
    options?: { replace?: boolean },
  ) => void;
  subscribe?: (onStoreChange: () => void) => () => void;
}

export function createSearchParamAdapter(
  options: CreateSearchParamAdapterOptions,
): SearchParamAdapter {
  return {
    getSearchParams: options.get,
    setSearchParams: options.set,
    subscribe: options.subscribe,
  };
}
