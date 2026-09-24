import type { HTMLAttributes, RefObject } from "react";
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
  /**
   * Where keyboard focus should land when the dialog closes, for the case where
   * the element that opened it has since unmounted. Leave unset and Radix
   * returns focus to the trigger, which is correct whenever the trigger is
   * still on the page.
   */
  returnFocusTo?: RefObject<HTMLElement | null>;
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
