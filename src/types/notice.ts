import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type NoticeVariant = "default" | "info" | "success" | "warning" | "error";

export interface NoticeClassNames {
  root?: string;
  icon?: string;
  header?: string;
  title?: string;
  body?: string;
}

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
