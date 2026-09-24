import { forwardRef, useCallback, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ExpandableItemProps } from "../../types/expandable-item";
import { cn } from "../../utils/cn";
import "./styles/expandable-item.css";

/**
 * Expandable list item: a bordered card whose header row (chevron toggle,
 * title, right-aligned status slot) expands a panel holding anything.
 */
export const ExpandableItem = forwardRef<HTMLDivElement, ExpandableItemProps>(
  function ExpandableItem(
    {
      title,
      status,
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
            classNames?.header,
          )}
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
            onClick={toggle}
          >
            <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
          </button>
          <span
            className={cn(
              "clet-expandable-item__title gsl-expandable-item__title",
              classNames?.title,
            )}
          >
            {title}
          </span>
          {status ? (
            <span
              className={cn(
                "clet-expandable-item__status gsl-expandable-item__status",
                classNames?.status,
              )}
            >
              {status}
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
