import type { ReactNode, HTMLAttributes } from "react";

export interface CardClassNames {
  root?: string;
  header?: string;
  body?: string;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: CardClassNames;
  header?: ReactNode;
  children?: ReactNode;
}
