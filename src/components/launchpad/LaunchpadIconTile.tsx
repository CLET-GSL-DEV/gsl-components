import type { ReactNode } from "react";
import { useMemo } from "react";
import { gradientIndexFromString, overlayIndexFromString } from "../../utils/stringToColor";
import { cn } from "../../utils/cn";
import { LAUNCHPAD_OVERLAYS } from "./LaunchpadOverlays";

const TILE_GRADIENT_COUNT = 9;

export interface LaunchpadIconTileProps {
  /** Seeds the deterministic background gradient and decorative overlay */
  name: string;
  /** Glyph rendered centered on top of the tile (icon or initials) */
  children: ReactNode;
  className?: string;
}

export function LaunchpadIconTile({ name, children, className }: LaunchpadIconTileProps) {
  // Gradient and overlay are picked by independent hashes (see
  // stringToColor.ts) so the two vary independently for the same name —
  // both are fixed brand values, so no theme dependency to track.
  const gradientClass = useMemo(
    () =>
      `clet-launchpad__tile--grad-${gradientIndexFromString(name, TILE_GRADIENT_COUNT)}`,
    [name],
  );
  const Overlay = useMemo(
    () => LAUNCHPAD_OVERLAYS[overlayIndexFromString(name, LAUNCHPAD_OVERLAYS.length)],
    [name],
  );

  return (
    <span className={cn("clet-launchpad__tile", gradientClass, className)}>
      <Overlay />
      <span className="clet-launchpad__tile-glyph">{children}</span>
    </span>
  );
}
