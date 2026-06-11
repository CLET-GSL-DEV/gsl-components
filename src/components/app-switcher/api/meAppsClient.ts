export function buildMeAppsUrl(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  return normalizedBaseUrl ? `${normalizedBaseUrl}/v1/me/apps` : "/v1/me/apps";
}

export function createMeAppsRequestInit(accessToken: string): RequestInit {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}
