import { ChevronRight, MoreHorizontal } from "lucide-react";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactElement,
} from "react";
import type {
  BreadcrumbEllipsisProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbListProps,
  BreadcrumbPageProps,
  BreadcrumbProps,
  BreadcrumbSeparatorProps,
} from "../../types/breadcrumb";
import { cn } from "../../utils/cn";
import "./styles/breadcrumb.css";

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb(
    {
      classNames,
      className,
      children,
      "aria-label": ariaLabel = "Breadcrumb",
      ...props
    },
    ref,
  ) {
    return (
      <nav
        ref={ref}
        className={cn("gsl-breadcrumb", classNames?.root, className)}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </nav>
    );
  },
);

export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  function BreadcrumbList({ classNames, className, children, ...props }, ref) {
    return (
      <ol
        ref={ref}
        className={cn("gsl-breadcrumb__list", classNames?.list, className)}
        {...props}
      >
        {children}
      </ol>
    );
  },
);

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ classNames, className, children, ...props }, ref) {
    return (
      <li
        ref={ref}
        className={cn("gsl-breadcrumb__item", classNames?.item, className)}
        {...props}
      >
        {children}
      </li>
    );
  },
);

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink(
    {
      asChild = false,
      classNames,
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) {
    const linkClassName = cn(
      "gsl-breadcrumb__link",
      classNames?.link,
      className,
    );

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string; onClick?: (e: MouseEvent) => void }>;

      return cloneElement(child, {
        ...props,
        onClick: (e: MouseEvent) => {
          e.preventDefault();
          (onClick as any)?.(e);
        },
        className: cn(linkClassName, child.props.className),
      });
    }

    return (
      <a
        ref={ref}
        className={linkClassName}
        onClick={(e) => {
          e.preventDefault();
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </a>
    );
  },
);

export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  function BreadcrumbPage({ classNames, className, children, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn("gsl-breadcrumb__page", classNames?.page, className)}
        aria-current="page"
        {...props}
      >
        {children}
      </span>
    );
  },
);

export const BreadcrumbSeparator = forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(function BreadcrumbSeparator(
  { classNames, className, children, ...props },
  ref,
) {
  return (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn(
        "gsl-breadcrumb__separator",
        classNames?.separator,
        className,
      )}
      {...props}
    >
      {children ?? (
        <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
      )}
    </li>
  );
});

export const BreadcrumbEllipsis = forwardRef<
  HTMLSpanElement,
  BreadcrumbEllipsisProps
>(function BreadcrumbEllipsis(
  {
    srLabel = "More",
    classNames,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn("gsl-breadcrumb__ellipsis", classNames?.ellipsis, className)}
      {...props}
    >
      {children ?? (
        <MoreHorizontal size={16} strokeWidth={2} aria-hidden="true" />
      )}
      <span
        className={cn("gsl-breadcrumb__sr-only", classNames?.srOnly)}
      >
        {srLabel}
      </span>
    </span>
  );
});
