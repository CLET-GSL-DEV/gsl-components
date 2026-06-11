import { useEffect, useRef, useState } from "react";
import { fetchMeApps } from "../api/fetchMeApps";
import {
  buildMeAppsUrl,
  createMeAppsRequestInit,
} from "../api/meAppsClient";
import { mapMeAppsToAppItems } from "../api/mapMeAppToAppItem";
import type { UseMeAppsOptions, UseMeAppsReturn } from "../../../types/app-switcher";

export function useMeApps(options: UseMeAppsOptions): UseMeAppsReturn {
  const { baseUrl, accessToken, enabled = true } = options;
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;
  const [apps, setApps] = useState<UseMeAppsReturn["apps"]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadApps() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchMeApps(
          buildMeAppsUrl(baseUrl),
          createMeAppsRequestInit(accessTokenRef.current),
        );

        if (cancelled) {
          return;
        }

        setApps(mapMeAppsToAppItems(response.data.apps));
      } catch (err) {
        if (cancelled) {
          return;
        }

        setApps([]);
        setError(err instanceof Error ? err.message : "Failed to load apps");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadApps();

    return () => {
      cancelled = true;
    };
  }, [baseUrl, enabled, reloadToken]);

  return {
    apps,
    loading,
    error,
    refetch: () => setReloadToken((value) => value + 1),
  };
}
