import { useCallback, useMemo, useSyncExternalStore } from "react";
import type {
  SearchParamOverlayData,
  SearchParamOverlayIdInput,
  SearchParamOverlayState,
  UseSearchParamOverlayOptions,
  UseSearchParamOverlayReturn,
} from "../types/search-param-overlay";
import { createBrowserSearchParamAdapter } from "./createBrowserSearchParamAdapter";
import {
  clearOverlayData,
  readOverlayData,
  writeOverlayData,
} from "./overlaySearchParamData";

const defaultBrowserAdapter = createBrowserSearchParamAdapter();

function resolveOverlayId<TData extends SearchParamOverlayData>(
  idOrState: SearchParamOverlayIdInput<TData>,
): string {
  return typeof idOrState === "string" ? idOrState : idOrState.id;
}

function serializeOverlayDataSnapshot(data: Record<string, string>) {
  const sortedEntries = Object.entries(data).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  return JSON.stringify(Object.fromEntries(sortedEntries));
}

export function useSearchParamOverlay<
  TData extends SearchParamOverlayData = SearchParamOverlayData,
>(
  idOrState: SearchParamOverlayIdInput<TData>,
  options: UseSearchParamOverlayOptions = {},
): UseSearchParamOverlayReturn<TData> {
  const id = resolveOverlayId(idOrState);
  const {
    param = "overlay",
    dataPrefix,
    replace = false,
    adapter = defaultBrowserAdapter,
  } = options;

  const getOpenSnapshot = useCallback(() => {
    return adapter.getSearchParams().get(param) === id;
  }, [adapter, id, param]);

  const getDataSnapshot = useCallback(() => {
    const params = adapter.getSearchParams();

    if (params.get(param) !== id) {
      return "";
    }

    return serializeOverlayDataSnapshot(
      readOverlayData(params, param, dataPrefix),
    );
  }, [adapter, dataPrefix, id, param]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!adapter.subscribe) {
        return () => {};
      }

      return adapter.subscribe(onStoreChange);
    },
    [adapter],
  );

  const open = useSyncExternalStore(
    subscribe,
    getOpenSnapshot,
    getOpenSnapshot,
  );
  const dataSnapshot = useSyncExternalStore(
    subscribe,
    getDataSnapshot,
    getDataSnapshot,
  );

  const data = useMemo(() => {
    if (!open) {
      return null;
    }

    if (!dataSnapshot) {
      return {};
    }

    return JSON.parse(dataSnapshot) as Partial<Record<keyof TData, string>>;
  }, [dataSnapshot, open]);

  const setOpen = useCallback(
    (next: boolean | SearchParamOverlayState<TData>) => {
      const params = new URLSearchParams(adapter.getSearchParams().toString());

      if (typeof next === "boolean") {
        if (next) {
          params.set(param, id);
        } else if (params.get(param) === id) {
          params.delete(param);
          clearOverlayData(params, param, dataPrefix);
        }
      } else {
        if (next.id !== id) {
          return;
        }

        params.set(param, id);
        writeOverlayData(params, param, next.data, dataPrefix);
      }

      adapter.setSearchParams(params, { replace });
    },
    [adapter, dataPrefix, id, param, replace],
  );

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
    },
    [setOpen],
  );

  const openWith = useCallback(
    (nextData?: TData) => {
      setOpen({ id, data: nextData });
    },
    [id, setOpen],
  );

  return useMemo(
    () => ({
      open,
      data,
      setOpen,
      onOpenChange,
      openWith,
    }),
    [data, onOpenChange, open, openWith, setOpen],
  );
}
