import type {
  SearchParamOverlayData,
  SearchParamOverlayIdInput,
  UseSearchParamOverlayOptions,
} from "../types/search-param-overlay";
import { useSearchParamOverlay } from "./useSearchParamOverlay";

export function useModalSearchParam<
  TData extends SearchParamOverlayData = SearchParamOverlayData,
>(
  idOrState: SearchParamOverlayIdInput<TData>,
  options: UseSearchParamOverlayOptions = {},
) {
  return useSearchParamOverlay<TData>(idOrState, {
    ...options,
    param: options.param ?? "modal",
  });
}
