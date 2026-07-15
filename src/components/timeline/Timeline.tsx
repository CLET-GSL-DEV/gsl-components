import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
} from "react";
import type {
  TimelineDataProps,
  TimelineFooterProps,
  TimelineItemProps,
  TimelineProps,
  TimelineTitleProps,
} from "../../types/timeline";
import { cn } from "../../utils/cn";
import "./styles/timeline.css";

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline({ classNames, className, children, ...props }, ref) {
    const items = Children.toArray(children).filter(
      (child): child is ReactElement<TimelineItemProps> =>
        isValidElement(child) && child.type === TimelineItem,
    );

    return (
      <ol
        ref={ref}
        className={cn("clet-timeline", classNames?.root, className)}
        {...props}
      >
        {items.map((item, index) =>
          cloneElement(item, {
            isLast: index === items.length - 1,
            key: item.key ?? `timeline-item-${index}`,
          }),
        )}
      </ol>
    );
  },
);

export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  function TimelineItem(
    { mode, color, icon, classNames, className, children, isLast, ...props },
    ref,
  ) {
    const dotStyle = color
      ? { backgroundColor: color, borderColor: color }
      : undefined;

    return (
      <li
        ref={ref}
        className={cn("clet-timeline__item", classNames?.root, className)}
        {...props}
      >
        <div className={cn("clet-timeline__rail", classNames?.rail)}>
          {isLast ? null : (
            <div
              className={cn(
                "clet-timeline__connector",
                classNames?.connector,
              )}
            />
          )}
          <div
            className={cn(
              "clet-timeline__dot",
              mode && `clet-timeline__dot--${mode}`,
              classNames?.dot,
            )}
            style={dotStyle}
            aria-hidden
          >
            {icon}
          </div>
        </div>
        {children ? (
          <div className={cn("clet-timeline__content", classNames?.content)}>
            {children}
          </div>
        ) : null}
      </li>
    );
  },
);

export const TimelineTitle = forwardRef<HTMLHeadingElement, TimelineTitleProps>(
  function TimelineTitle(
    { as: Tag = "h3", classNames, className, children, ...props },
    ref,
  ) {
    return (
      <Tag
        ref={ref}
        className={cn("clet-timeline__title", classNames?.title, className)}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);

export const TimelineData = forwardRef<HTMLParagraphElement, TimelineDataProps>(
  function TimelineData({ classNames, className, children, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn("clet-timeline__data", classNames?.data, className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);

export const TimelineFooter = forwardRef<HTMLDivElement, TimelineFooterProps>(
  function TimelineFooter({ classNames, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-timeline__footer", classNames?.footer, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
