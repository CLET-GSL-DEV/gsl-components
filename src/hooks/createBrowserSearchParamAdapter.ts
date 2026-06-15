import type { SearchParamAdapter } from "../types/search-param-overlay";

function buildUrl(pathname: string, search: string, hash: string) {
  const query = search ? `?${search}` : "";
  return `${pathname}${query}${hash}`;
}

export function createBrowserSearchParamAdapter(): SearchParamAdapter {
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    getSearchParams: () => new URLSearchParams(window.location.search),
    setSearchParams: (params, options) => {
      const { pathname, hash } = window.location;
      const url = buildUrl(pathname, params.toString(), hash);

      if (options?.replace) {
        window.history.replaceState(window.history.state, "", url);
      } else {
        window.history.pushState(window.history.state, "", url);
      }

      notify();
    },
    subscribe: (onStoreChange) => {
      listeners.add(onStoreChange);

      const onPopState = () => {
        onStoreChange();
      };

      window.addEventListener("popstate", onPopState);

      return () => {
        listeners.delete(onStoreChange);
        window.removeEventListener("popstate", onPopState);
      };
    },
  };
}
