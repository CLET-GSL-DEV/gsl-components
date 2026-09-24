import type { HTMLAttributes, ReactNode } from "react";

export interface ExpandableItemClassNames {
  root?: string;
  header?: string;
  toggle?: string;
  title?: string;
  status?: string;
  content?: string;
}

export interface ExpandableItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Heading shown in the header row. */
  title: ReactNode;
  /**
   * Right-aligned status slot (e.g. a dot plus "In progress"). The consumer
   * composes and colours it; the component only positions it.
   */
  status?: ReactNode;
  /** Content revealed when expanded. Anything may go here. */
  children?: ReactNode;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial expanded state (uncontrolled, default false). */
  defaultExpanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  classNames?: ExpandableItemClassNames;
  className?: string;
}
