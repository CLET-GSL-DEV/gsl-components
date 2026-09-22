import type { HTMLAttributes, ReactNode } from "react";

export interface EmptyStateClassNames {
  root?: string;
  illustration?: string;
  title?: string;
  description?: string;
  action?: string;
}

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Illustration rendered above the text at the Figma proportions
   * (363×271, full width up to that size). Defaults to the empty-state
   * artwork; pass null for a text-only empty state.
   */
  illustration?: ReactNode;
  /** Configurable heading (e.g. "No certificates yet"). */
  title: ReactNode;
  /** Configurable supporting copy under the heading. */
  description?: ReactNode;
  /**
   * Optional action slot below the copy — the consumer passes whatever
   * button they want (or nothing). Never hardcoded by the component.
   */
  action?: ReactNode;
  classNames?: EmptyStateClassNames;
  className?: string;
}
