import type { HTMLAttributes, ReactNode } from "react";

export interface ExpandableItemClassNames {
  root?: string;
  header?: string;
  toggle?: string;
  title?: string;
  trailing?: string;
  content?: string;
}

export interface ExpandableItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Left side of the header row: a title string, a full component, anything.
   * Optional; the row also works with only a toggle and a trailing slot.
   */
  title?: ReactNode;
  /**
   * Right side of the header row. Not status-only: status text, a button, a
   * badge row, whatever the row needs. Interactive children keep working;
   * clicking them does not toggle the item.
   */
  trailing?: ReactNode;
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
