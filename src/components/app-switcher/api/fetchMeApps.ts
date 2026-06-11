import type { MeAppsResponse } from "../../../types/app-switcher";

export class MeAppsFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MeAppsFetchError";
  }
}

export async function fetchMeApps(
  url = "/v1/me/apps",
  init?: RequestInit,
): Promise<MeAppsResponse> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new MeAppsFetchError(`Failed to load apps (${response.status})`);
  }

  const payload = (await response.json()) as MeAppsResponse;

  if (!payload.success) {
    throw new MeAppsFetchError(payload.message || "Failed to load apps");
  }

  return payload;
}
