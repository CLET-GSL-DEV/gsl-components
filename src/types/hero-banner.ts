import type { HTMLAttributes, ReactNode } from "react";

export interface HeroBannerImage {
  src: string;
  alt?: string;
}

export interface HeroBannerClassNames {
  root?: string;
  image?: string;
  content?: string;
  text?: string;
  greeting?: string;
  name?: string;
  role?: string;
  date?: string;
}

export interface HeroBannerProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "role"
> {
  /**
   * Greeting line above the name. Defaults to "Good morning,".
   */
  greeting?: ReactNode;
  /** Person's name — always a prop, never hardcoded. */
  name: ReactNode;
  /** Role line under the name (e.g. "Director General"). */
  role?: ReactNode;
  /**
   * Date shown under the name. Defaults to the current day rendered as
   * e.g. "Sunday, 30 August 2026". Pass a string to override.
   */
  date?: string;
  /**
   * Preset image variants. Defaults to the eight Figma hero artworks.
   */
  images?: HeroBannerImage[];
  /** Active image index. */
  imageVariant?: number;
  /**
   * Initial image index when uncontrolled. Omit to pick a random image
   * from `images` on each visit.
   */
  defaultImageVariant?: number;
  classNames?: HeroBannerClassNames;
  className?: string;
}
