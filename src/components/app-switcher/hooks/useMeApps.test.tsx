import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMeApps } from "./useMeApps";
import { sampleMeAppsResponse } from "../../../test/fixtures";

describe("useMeApps", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and maps apps from the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleMeAppsResponse,
      }),
    );

    const { result } = renderHook(() =>
      useMeApps({
        baseUrl: "https://api.example.com",
        accessToken: "secret-token",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/v1/me/apps",
      {
        headers: {
          Authorization: "Bearer secret-token",
        },
      },
    );
    expect(result.current.apps).toHaveLength(1);
    expect(result.current.apps[0]?.name).toBe("Governance Portal");
    expect(result.current.error).toBeNull();
  });

  it("returns an error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const { result } = renderHook(() =>
      useMeApps({
        baseUrl: "https://api.example.com",
        accessToken: "secret-token",
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.apps).toEqual([]);
    expect(result.current.error).toBe("Failed to load apps (500)");
  });

  it("does not fetch when disabled", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const { result } = renderHook(() =>
      useMeApps({
        baseUrl: "https://api.example.com",
        accessToken: "secret-token",
        enabled: false,
      }),
    );

    expect(result.current.loading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
