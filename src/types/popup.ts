import type { HTMLAttributes } from "react";
import type * as PopoverPrimitive from "@radix-ui/react-popover";

export interface PopupContentClassNames {
  content?: string;
  close?: string;
}

export interface PopupContentProps
  extends PopoverPrimitive.PopoverContentProps {
  classNames?: PopupContentClassNames;
  showCloseButton?: boolean;
}

export interface PopupHeaderClassNames {
  header?: string;
}

export interface PopupHeaderProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: PopupHeaderClassNames;
}

export interface PopupTitleClassNames {
  title?: string;
}

export interface PopupTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  classNames?: PopupTitleClassNames;
}

export interface PopupDescriptionClassNames {
  description?: string;
}

export interface PopupDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {
  classNames?: PopupDescriptionClassNames;
}

export interface PopupBodyClassNames {
  body?: string;
}

export interface PopupBodyProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: PopupBodyClassNames;
}

export type PopupFooterLayout = "row" | "stack";

export interface PopupFooterClassNames {
  footer?: string;
}

export interface PopupFooterProps extends HTMLAttributes<HTMLDivElement> {
  layout?: PopupFooterLayout;
  classNames?: PopupFooterClassNames;
}
