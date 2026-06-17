import type { HTMLAttributes } from "react";
import type * as DialogPrimitive from "@radix-ui/react-dialog";

export interface DialogOverlayClassNames {
  overlay?: string;
}

export interface DialogOverlayProps
  extends DialogPrimitive.DialogOverlayProps {
  classNames?: DialogOverlayClassNames;
}

export interface DialogContentClassNames {
  content?: string;
  close?: string;
}

export interface DialogContentProps
  extends DialogPrimitive.DialogContentProps {
  classNames?: DialogContentClassNames;
  showCloseButton?: boolean;
}

export interface DialogTitleClassNames {
  title?: string;
}

export interface DialogTitleProps extends DialogPrimitive.DialogTitleProps {
  classNames?: DialogTitleClassNames;
}

export interface DialogDescriptionClassNames {
  description?: string;
}

export interface DialogDescriptionProps
  extends DialogPrimitive.DialogDescriptionProps {
  classNames?: DialogDescriptionClassNames;
}

export interface DialogHeaderClassNames {
  header?: string;
}

export interface DialogHeaderProps
  extends HTMLAttributes<HTMLDivElement> {
  classNames?: DialogHeaderClassNames;
}

export interface DialogBodyClassNames {
  body?: string;
}

export interface DialogBodyProps
  extends HTMLAttributes<HTMLDivElement> {
  classNames?: DialogBodyClassNames;
}

export interface DialogFooterClassNames {
  footer?: string;
}

export interface DialogFooterProps
  extends HTMLAttributes<HTMLDivElement> {
  classNames?: DialogFooterClassNames;
}
