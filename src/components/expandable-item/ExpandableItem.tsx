import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ChevronDown } from "lucide-react";
import type { ExpandableItemProps } from "../../types/expandable-item";
import { cn } from "../../utils/cn";
import "./styles/expandable-item.css";

/**
 * Expandable list item: header click opens, only the chevron folds back.
 * Interactive header children never toggle.
 */
export const ExpandableItem = forwardRef<HTMLDivElement, ExpandableItemProps>(
  function ExpandableItem(
    {
      title,
      trailing,
      children,
      expanded: expandedProp,
      defaultExpanded = false,
      onExpandedChange,
      classNames,
      className,
      ...props
    },
    ref,
  ) {
    const itemId = useId();
    const toggleId = `${itemId}-toggle`;
    const contentId = `${itemId}-content`;
    const [uncontrolledExpanded, setUncontrolledExpanded] =
      useState(defaultExpanded);
    const expanded = expandedProp ?? uncontrolledExpanded;

    const setExpanded = useCallback(
      (next: boolean) => {
        if (expandedProp === undefined) {
          setUncontrolledExpanded(next);
        }
        onExpandedChange?.(next);
      },
      [expandedProp, onExpandedChange],
    );

    const toggle = useCallback(() => {
      setExpanded(!expanded);
    }, [expanded, setExpanded]);

    const handleHeaderClick = useCallback(
      (event: ReactMouseEvent<HTMLDivElement>) => {
        if (expanded) return;
        const target = event.target as HTMLElement | null;
        if (
          target?.closest?.(
            "button, a, [role='button'], input, select, textarea, [contenteditable]",
          )
        ) {
          return;
        }
        setExpanded(true);
      },
      [expanded, setExpanded],
    );

    const handleToggleClick = useCallback(
      (event: ReactMouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        toggle();
      },
      [toggle],
    );

    return (
      <div
        ref={ref}
        className={cn(
          "clet-expandable-item gsl-expandable-item",
          expanded && "clet-expandable-item--expanded gsl-expandable-item--expanded",
          classNames?.root,
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "clet-expandable-item__header gsl-expandable-item__header",
            !expanded && "clet-expandable-item__header--collapsed gsl-expandable-item__header--collapsed",
            classNames?.header,
          )}
          onClick={handleHeaderClick}
        >
          <button
            type="button"
            id={toggleId}
            className={cn(
              "clet-expandable-item__toggle gsl-expandable-item__toggle",
              classNames?.toggle,
            )}
            aria-expanded={expanded}
            aria-controls={contentId}
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={handleToggleClick}
          >
            <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
          </button>
          {title != null ? (
            <span
              className={cn(
                "clet-expandable-item__title gsl-expandable-item__title",
                classNames?.title,
              )}
            >
              {title}
            </span>
          ) : null}
          {trailing ? (
            <span
              className={cn(
                "clet-expandable-item__trailing gsl-expandable-item__trailing",
                classNames?.trailing,
              )}
            >
              {trailing}
            </span>
          ) : null}
        </div>
        <div
          id={contentId}
          role="region"
          aria-labelledby={toggleId}
          className={cn(
            "clet-expandable-item__content gsl-expandable-item__content",
            classNames?.content,
          )}
          data-state={expanded ? "expanded" : "collapsed"}
          inert={!expanded}
        >
          <div className="clet-expandable-item__content-inner gsl-expandable-item__content-inner">
            {children}
          </div>
        </div>
      </div>
    );
  },
);
