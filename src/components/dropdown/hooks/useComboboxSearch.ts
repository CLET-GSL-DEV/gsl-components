import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DropdownOption,
  UseComboboxSearchOptions,
  UseComboboxSearchReturn,
} from "../../../types/dropdown";

export function useComboboxSearch({
  loadOptions,
  debounceMs = 300,
  minSearchLength = 0,
  enabled = true,
}: UseComboboxSearchOptions): UseComboboxSearchReturn {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const loadOptionsRef = useRef(loadOptions);
  loadOptionsRef.current = loadOptions;

  const reset = useCallback(() => {
    setQuery("");
    setOptions([]);
    setLoading(false);
    setError(null);
    requestIdRef.current += 1;
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (query.length < minSearchLength) {
      setOptions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      void loadOptionsRef
        .current(query)
        .then((results) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setOptions(results);
          setLoading(false);
        })
        .catch((err) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setOptions([]);
          setError(err instanceof Error ? err.message : "Search failed");
          setLoading(false);
        });
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, enabled, minSearchLength, query]);

  return {
    query,
    setQuery,
    options,
    loading,
    error,
    reset,
  };
}
