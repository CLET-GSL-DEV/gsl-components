import type {
  HTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
  ReactNode,
} from "react";

export type TimelineItemStatus = "complete" | "current" | "warning" | "error";

export interface TimelineClassNames {
  root?: string;
}

export interface TimelineProps extends Omit<
  OlHTMLAttributes<HTMLOListElement>,
  "className"
> {
  classNames?: TimelineClassNames;
  className?: string;
  children: ReactNode;
}

export interface TimelineItemClassNames {
  root?: string;
  rail?: string;
  dot?: string;
  connector?: string;
  content?: string;
}

export interface TimelineItemProps extends Omit<
  LiHTMLAttributes<HTMLLIElement>,
  "className"
> {
  status?: TimelineItemStatus;
  color?: string;
  icon?: ReactNode;
  classNames?: TimelineItemClassNames;
  className?: string;
  children?: ReactNode;
  isLast?: boolean;
}

export interface TimelineTitleClassNames {
  title?: string;
}

export interface TimelineTitleProps extends Omit<
  HTMLAttributes<HTMLHeadingElement>,
  "className"
> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  classNames?: TimelineTitleClassNames;
  className?: string;
  children: ReactNode;
}

export interface TimelineDataClassNames {
  data?: string;
}

export interface TimelineDataProps extends Omit<
  HTMLAttributes<HTMLParagraphElement>,
  "className"
> {
  classNames?: TimelineDataClassNames;
  className?: string;
  children: ReactNode;
}

export interface TimelineFooterClassNames {
  footer?: string;
}

export interface TimelineFooterProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "className"
> {
  classNames?: TimelineFooterClassNames;
  className?: string;
  children: ReactNode;
}
