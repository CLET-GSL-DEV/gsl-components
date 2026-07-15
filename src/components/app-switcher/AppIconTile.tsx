import type { ReactNode } from "react";
import { useId } from "react";
import { patternIndexFromString, vividGradientFromString } from "../../utils/stringToColor";
import { cn } from "../../utils/cn";
import { TILE_PATTERN_COUNT, TilePattern } from "./IconPatterns";

export interface AppIconTileProps {
  /** Seeds the deterministic background gradient and pattern texture */
  name: string;
  /** Glyph rendered centered on top of the tile (icon or initials) */
  children: ReactNode;
  className?: string;
}

export function AppIconTile({ name, children, className }: AppIconTileProps) {
  const resolvedTheme =
    typeof document !== "undefined"
      ? (document.documentElement.getAttribute("data-clet-theme") ?? undefined)
      : undefined;

  const background = vividGradientFromString(name, resolvedTheme);
  const patternIndex = patternIndexFromString(name, TILE_PATTERN_COUNT);
  const patternId = `clet-app-icon-pattern-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <span
      className={cn("clet-app-switcher__tile gsl-app-switcher__tile", className)}
      style={{ background }}
    >
      <svg className="clet-app-switcher__tile-pattern gsl-app-switcher__tile-pattern" aria-hidden="true" focusable="false">
        <TilePattern index={patternIndex} patternId={patternId} />
      </svg>
      <span className="clet-app-switcher__tile-glyph gsl-app-switcher__tile-glyph">{children}</span>
    </span>
  );
}
