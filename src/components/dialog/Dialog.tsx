import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";
import type {
  DialogBodyProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayProps,
  DialogTitleProps,
} from "../../types/dialog";
import { cn } from "../../utils/cn";
import {
  buildCloseAutoFocusHandler,
  createModalityAwareRoot,
  useDialogModality,
} from "../../utils/dialog-modality";
import "./styles/dialog.css";

export const Dialog = createModalityAwareRoot("Dialog");
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ className, classNames, ...props }, ref) {
    return (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn("clet-dialog__overlay gsl-dialog__overlay", classNames?.overlay, className)}
        {...props}
      />
    );
  },
);

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    {
      className,
      classNames,
      children,
      showCloseButton = false,
      returnFocusTo,
      onCloseAutoFocus,
      ...props
    },
    ref,
  ) {
    const isModal = useDialogModality();
    return (
      <DialogPrimitive.Content
        ref={ref}
        className={cn("clet-dialog__content gsl-dialog__content", classNames?.content, className)}
        onCloseAutoFocus={buildCloseAutoFocusHandler(
          returnFocusTo,
          onCloseAutoFocus,
        )}
        {...props}
        // After the spread on purpose: Radix ships no aria-modal, and a caller
        // must not be able to drop it. False modality omits it rather than lying.
        aria-modal={isModal ? true : undefined}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            type="button"
            className={cn("clet-dialog__close gsl-dialog__close", classNames?.close)}
            aria-label="Close dialog"
          >
            <X size={16} strokeWidth={2} aria-hidden />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    );
  },
);

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, classNames, ...props }, ref) {
    return (
      <DialogPrimitive.Title
        ref={ref}
        className={cn("clet-dialog__title gsl-dialog__title", classNames?.title, className)}
        {...props}
      />
    );
  },
);

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(function DialogDescription({ className, classNames, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(
        "clet-dialog__description gsl-dialog__description",
        classNames?.description,
        className,
      )}
      {...props}
    />
  );
});

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-dialog__header gsl-dialog__header", classNames?.header, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  function DialogBody({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-dialog__body gsl-dialog__body", classNames?.body, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-dialog__footer gsl-dialog__footer", classNames?.footer, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
