export interface SearchParamAdapter {
  getSearchParams: () => URLSearchParams;
  setSearchParams: (
    params: URLSearchParams,
    options?: { replace?: boolean },
  ) => void;
  subscribe?: (onStoreChange: () => void) => () => void;
}

export type SearchParamOverlayData = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface SearchParamOverlayState<
  TData extends SearchParamOverlayData = SearchParamOverlayData,
> {
  id: string;
  data?: TData;
}

export interface UseSearchParamOverlayOptions {
  param?: string;
  dataPrefix?: string;
  replace?: boolean;
  adapter?: SearchParamAdapter;
}

export interface UseSearchParamOverlayReturn<
  TData extends SearchParamOverlayData = SearchParamOverlayData,
> {
  open: boolean;
  data: Partial<Record<keyof TData, string>> | null;
  setOpen: (next: boolean | SearchParamOverlayState<TData>) => void;
  onOpenChange: (open: boolean) => void;
  openWith: (data?: TData) => void;
}

export type SearchParamOverlayIdInput<
  TData extends SearchParamOverlayData = SearchParamOverlayData,
> = string | Pick<SearchParamOverlayState<TData>, "id">;
