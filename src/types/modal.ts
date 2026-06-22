import type { ComponentPropsWithoutRef } from "react";
import type * as DialogPrimitive from "@radix-ui/react-dialog";

// ⬇️ ADDED
export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ModalOverlayClassNames {
  overlay?: string;
}

export interface ModalOverlayProps
  extends DialogPrimitive.DialogOverlayProps {
  classNames?: ModalOverlayClassNames;
}

export interface ModalContentClassNames {
  content?: string;
  close?: string;
}

export interface ModalContentProps
  extends DialogPrimitive.DialogContentProps {
  classNames?: ModalContentClassNames;
  showCloseButton?: boolean;
  // ⬇️ ADDED
  size?: ModalSize;
  preventClose?: boolean;
  preventCloseTitle?: string;
  preventCloseDescription?: string;
  onOpenChange?: (open: boolean) => void;
}

export interface ModalHeaderClassNames {
  header?: string;
}

export interface ModalHeaderProps extends ComponentPropsWithoutRef<"header"> {
  classNames?: ModalHeaderClassNames;
}

export interface ModalTitleClassNames {
  title?: string;
}

export interface ModalTitleProps extends DialogPrimitive.DialogTitleProps {
  classNames?: ModalTitleClassNames;
}

export interface ModalDescriptionClassNames {
  description?: string;
}

export interface ModalDescriptionProps
  extends DialogPrimitive.DialogDescriptionProps {
  classNames?: ModalDescriptionClassNames;
}

export interface ModalBodyClassNames {
  body?: string;
}

export interface ModalBodyProps extends ComponentPropsWithoutRef<"div"> {
  classNames?: ModalBodyClassNames;
}

export interface ModalFooterClassNames {
  footer?: string;
}

export interface ModalFooterProps extends ComponentPropsWithoutRef<"footer"> {
  classNames?: ModalFooterClassNames;
}
