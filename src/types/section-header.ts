import type { HTMLAttributes } from "react";

export interface SectionHeaderClassNames {
  root?: string;
}

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: SectionHeaderClassNames;
}

export interface SectionTitleClassNames {
  title?: string;
}

export interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  classNames?: SectionTitleClassNames;
}

export interface SectionDescriptionClassNames {
  description?: string;
}

export interface SectionDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {
  classNames?: SectionDescriptionClassNames;
}

export interface SectionActionsClassNames {
  actions?: string;
}

export interface SectionActionsProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: SectionActionsClassNames;
}
