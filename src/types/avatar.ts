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
  classNames?: AvatarClassNames;
  className?: string;
}
