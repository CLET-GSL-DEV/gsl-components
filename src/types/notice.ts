import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type NoticeVariant = "default" | "info" | "success" | "warning" | "error";

export interface NoticeClassNames {
  root?: string;
  icon?: string;
  header?: string;
  title?: string;
  body?: string;
}

/**
 * @deprecated `Notice` is deprecated in favor of `Banner` — the page-level
 * persistent notice with info/success/warning/danger variants, heading +
 * subtext, action slot, and dismiss button.
 */
export interface NoticeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: NoticeVariant;
  /** Custom accent color, overriding the variant's token-driven color. Any valid CSS color. */
  color?: CSSProperties["color"];
  title?: ReactNode;
  icon?: ReactNode;
  /** Thick colored left border accent. */
  leftBorder?: boolean;
  /** Dashed outer border instead of a solid one. */
  dashed?: boolean;
  classNames?: NoticeClassNames;
  className?: string;
  children?: ReactNode;
}
