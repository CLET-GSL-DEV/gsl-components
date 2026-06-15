import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";
import type {
  DialogContentProps,
  DialogDescriptionProps,
  DialogOverlayProps,
  DialogTitleProps,
} from "../../types/dialog";
import { cn } from "../../utils/cn";
import "./styles/dialog.css";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ className, classNames, ...props }, ref) {
    return (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn("gsl-dialog__overlay", classNames?.overlay, className)}
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
      ...props
    },
    ref,
  ) {
    return (
      <DialogPrimitive.Content
        ref={ref}
        className={cn("gsl-dialog__content", classNames?.content, className)}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            type="button"
            className={cn("gsl-dialog__close", classNames?.close)}
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
        className={cn("gsl-dialog__title", classNames?.title, className)}
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
        "gsl-dialog__description",
        classNames?.description,
        className,
      )}
      {...props}
    />
  );
});
