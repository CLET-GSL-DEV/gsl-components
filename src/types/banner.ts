import type { HTMLAttributes, ReactNode } from "react";

export type BannerVariant = "info" | "success" | "warning" | "danger";

export interface BannerClassNames {
  root?: string;
  accent?: string;
  content?: string;
  heading?: string;
  subtext?: string;
  actions?: string;
  action?: string;
  close?: string;
}

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Colour meaning. The accent bar, background tint, and action link all
   * carry the same status — colour is never the only signal.
   * Defaults to `"info"`.
   */
  variant?: BannerVariant;
  /** Heading line (14px). */
  heading: ReactNode;
  /** Supporting line under the heading (12px). */
  subtext?: ReactNode;
  /**
   * Action slot on the right (e.g. a "View details" link). Pass whatever
   * control fits, or nothing.
   */
  action?: ReactNode;
  /**
   * Dismiss handler. The ✕ close button renders only when this is
   * provided — it is its own button with its own action.
   */
  onClose?: () => void;
  /** Accessible label for the close button. Defaults to "Dismiss". */
  closeLabel?: string;
  classNames?: BannerClassNames;
  className?: string;
}
