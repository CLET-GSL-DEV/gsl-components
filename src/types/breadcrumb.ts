import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
  ReactNode,
} from "react";

export interface BreadcrumbClassNames {
  root?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  classNames?: BreadcrumbClassNames;
  className?: string;
  children: ReactNode;
}

export interface BreadcrumbListClassNames {
  list?: string;
}

export interface BreadcrumbListProps extends OlHTMLAttributes<HTMLOListElement> {
  classNames?: BreadcrumbListClassNames;
  className?: string;
  children: ReactNode;
}

export interface BreadcrumbItemClassNames {
  item?: string;
}

export interface BreadcrumbItemProps extends LiHTMLAttributes<HTMLLIElement> {
  classNames?: BreadcrumbItemClassNames;
  className?: string;
  children: ReactNode;
}

export interface BreadcrumbLinkClassNames {
  link?: string;
}

export interface BreadcrumbLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
  classNames?: BreadcrumbLinkClassNames;
  className?: string;
  children: ReactNode;
}

export interface BreadcrumbPageClassNames {
  page?: string;
}

export interface BreadcrumbPageProps extends HTMLAttributes<HTMLSpanElement> {
  classNames?: BreadcrumbPageClassNames;
  className?: string;
  children: ReactNode;
}

export interface BreadcrumbSeparatorClassNames {
  separator?: string;
}

export interface BreadcrumbSeparatorProps
  extends LiHTMLAttributes<HTMLLIElement> {
  classNames?: BreadcrumbSeparatorClassNames;
  className?: string;
  children?: ReactNode;
}

export interface BreadcrumbEllipsisClassNames {
  ellipsis?: string;
  srOnly?: string;
}

export interface BreadcrumbEllipsisProps extends HTMLAttributes<HTMLSpanElement> {
  srLabel?: string;
  classNames?: BreadcrumbEllipsisClassNames;
  className?: string;
  children?: ReactNode;
}
