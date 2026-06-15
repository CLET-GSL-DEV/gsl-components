import type { SearchParamOverlayData } from "../types/search-param-overlay";

export function getDataPrefix(param: string, dataPrefix?: string) {
  return dataPrefix ?? `${param}.`;
}

export function readOverlayData(
  params: URLSearchParams,
  param: string,
  dataPrefix?: string,
): Record<string, string> {
  const prefix = getDataPrefix(param, dataPrefix);
  const data: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    if (key.startsWith(prefix) && key.length > prefix.length) {
      data[key.slice(prefix.length)] = value;
    }
  }

  return data;
}

export function clearOverlayData(
  params: URLSearchParams,
  param: string,
  dataPrefix?: string,
) {
  const prefix = getDataPrefix(param, dataPrefix);

  for (const key of [...params.keys()]) {
    if (key.startsWith(prefix)) {
      params.delete(key);
    }
  }
}

export function writeOverlayData(
  params: URLSearchParams,
  param: string,
  data?: SearchParamOverlayData,
  dataPrefix?: string,
) {
  clearOverlayData(params, param, dataPrefix);

  if (!data) {
    return;
  }

  const prefix = getDataPrefix(param, dataPrefix);

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue;
    }

    params.set(`${prefix}${key}`, String(value));
  }
}
