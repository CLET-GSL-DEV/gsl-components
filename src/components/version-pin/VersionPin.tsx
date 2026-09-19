import { forwardRef } from "react";
import type { VersionPinProps } from "../../types/version-pin";
import { cn } from "../../utils/cn";
import "./styles/version-pin.css";

function versionClass(version: string): string {
  return `clet-version-pin--${version.replace(".", "-")}`;
}

/**
 * Freezes a subtree at an older design-system version.
 *
 * Additive versioning: the latest version is the default everywhere (no
 * wrapper needed). Wrap only frozen shells (demo `/v2`, `/legacy`, or a
 * consumer pinning an old look) — CSS in `src/styles/versions.css` scopes
 * overrides under `[data-clet-version="<pin>"]` so they never leak.
 */
export const VersionPin = forwardRef<HTMLDivElement, VersionPinProps>(
  function VersionPin({ version, classNames, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-clet-version={version}
        data-gsl-version={version}
        className={cn(
          "clet-version-pin",
          versionClass(version),
          classNames?.root,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
