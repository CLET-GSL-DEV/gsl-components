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
