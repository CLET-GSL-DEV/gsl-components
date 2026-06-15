import type { ComponentPropsWithoutRef } from "react";
import type * as DialogPrimitive from "@radix-ui/react-dialog";

export type SheetSide = "top" | "right" | "bottom" | "left";

export interface SheetOverlayClassNames {
  overlay?: string;
}

export interface SheetOverlayProps
  extends DialogPrimitive.DialogOverlayProps {
  classNames?: SheetOverlayClassNames;
}

export interface SheetContentClassNames {
  content?: string;
  close?: string;
}

export interface SheetContentProps
  extends DialogPrimitive.DialogContentProps {
  classNames?: SheetContentClassNames;
  showCloseButton?: boolean;
  side?: SheetSide;
}

export interface SheetHeaderClassNames {
  header?: string;
}

export interface SheetHeaderProps extends ComponentPropsWithoutRef<"header"> {
  classNames?: SheetHeaderClassNames;
}

export interface SheetTitleClassNames {
  title?: string;
}

export interface SheetTitleProps extends DialogPrimitive.DialogTitleProps {
  classNames?: SheetTitleClassNames;
}

export interface SheetDescriptionClassNames {
  description?: string;
}

export interface SheetDescriptionProps
  extends DialogPrimitive.DialogDescriptionProps {
  classNames?: SheetDescriptionClassNames;
}

export interface SheetBodyClassNames {
  body?: string;
}

export interface SheetBodyProps extends ComponentPropsWithoutRef<"div"> {
  classNames?: SheetBodyClassNames;
}

export interface SheetFooterClassNames {
  footer?: string;
}

export interface SheetFooterProps extends ComponentPropsWithoutRef<"footer"> {
  classNames?: SheetFooterClassNames;
}
