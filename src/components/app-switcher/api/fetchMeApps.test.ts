import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMeApps, MeAppsFetchError } from "./fetchMeApps";
import { sampleMeAppsResponse } from "../../../test/fixtures";

describe("fetchMeApps", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed apps when the API succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleMeAppsResponse,
      }),
    );

    await expect(fetchMeApps("https://api.example.com/v1/me/apps")).resolves.toEqual(
      sampleMeAppsResponse,
    );
  });

  it("throws when the HTTP response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );

    await expect(fetchMeApps("/v1/me/apps")).rejects.toThrow(
      new MeAppsFetchError("Failed to load apps (401)"),
    );
  });

  it("throws when the API returns success=false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          message: "Unauthorized",
          data: { apps: [] },
          meta: { count: 0 },
        }),
      }),
    );

    await expect(fetchMeApps("/v1/me/apps")).rejects.toThrow(
      new MeAppsFetchError("Unauthorized"),
    );
  });
});
