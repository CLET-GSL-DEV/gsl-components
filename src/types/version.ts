/**
 * Additive design-system version pins.
 *
 * Defaults (no `data-clet-version` attribute) always render the LATEST
 * version. Older versions opt in to frozen overrides by stamping
 * `data-clet-version="<pin>"` on a subtree — typically via `<VersionPin>` or
 * the `version` prop on `AppLayout`.
 *
 * Additive means: new versions only ADD a new `[data-clet-version="x.y"]`
 * block in `src/styles/versions.css`. Never edit or delete an older block,
 * never change a default token to fix an old version.
 */

export const CLET_VERSIONS = ["1.22", "2.2", "2.3", "2.4"] as const;

export type CletVersion = (typeof CLET_VERSIONS)[number];

export type GslVersion = CletVersion;

/** Defaults render this. Bump when a new version ships. */
export const LATEST_CLET_VERSION: CletVersion = "2.4";

export const LATEST_GSL_VERSION: GslVersion = LATEST_CLET_VERSION;

const VERSION_SET = new Set<string>(CLET_VERSIONS);

export function isCletVersion(value: unknown): value is CletVersion {
  return typeof value === "string" && VERSION_SET.has(value);
}
