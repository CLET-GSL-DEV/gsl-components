import type { HTMLAttributes } from "react";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarClassNames {
  root?: string;
  image?: string;
  initials?: string;
}

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Name used for initials fallback and gradient color. */
  name: string;
  /** Image URL. When provided and loads successfully, image is shown. */
  src?: string;
  /** Preset size or arbitrary pixel value (e.g. 48). */
  size?: AvatarSize | number;
  /** CSS background override for the initials fallback (e.g. `var(--gsl-primary)`). Defaults to a per-name gradient. */
  background?: string;
  /**
   * Name of a CSS custom property (e.g. `--gsl-profile-avatar-bg`) that can
   * override the background when set by a consumer. Falls back to the
   * per-name gradient when the property is unset. Ignored if `background`
   * is also provided.
   */
  backgroundVar?: string;
  classNames?: AvatarClassNames;
  className?: string;
}
