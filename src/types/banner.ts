import type { HTMLAttributes, ReactNode } from "react";

export type BannerVariant = "info" | "success" | "warning" | "danger";

/**
 * - `"outlined"` (default): transparent surface, status-coloured border, soft shadow.
 * - `"filled"`: status-tinted surface with no border or shadow.
 */
export type BannerAppearance = "outlined" | "filled";

export interface BannerClassNames {
  root?: string;
  accent?: string;
  content?: string;
  heading?: string;
  subtext?: string;
  /** The "Read more" / "Show less" toggle on a long subtext. */
  more?: string;
  actions?: string;
  action?: string;
  close?: string;
}

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Colour meaning. The border (or tint), accent bar, and action all carry
   * the same status; colour is never the only signal.
   * Defaults to `"info"`.
   */
  variant?: BannerVariant;
  /** Surface treatment. Defaults to `"outlined"`. */
  appearance?: BannerAppearance;
  /** Heading line (14px). */
  heading: ReactNode;
  /**
   * Supporting text under the heading (12px). Held to two lines; when it
   * runs longer, an inline "Read more" toggle expands it in place.
   */
  subtext?: ReactNode;
  /** Label of the toggle that expands a long subtext. Defaults to "Read more". */
  expandLabel?: string;
  /** Label of the toggle that collapses it again. Defaults to "Show less". */
  collapseLabel?: string;
  /**
   * Action slot on the right. It renders as plain status-coloured text:
   * pass `<button type="button" onClick={...}>`, which loses its chrome
   * here, rather than a bordered `Button`.
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
