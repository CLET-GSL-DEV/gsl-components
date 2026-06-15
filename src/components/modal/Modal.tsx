import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";
import type {
  ModalBodyProps,
  ModalContentProps,
  ModalDescriptionProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalOverlayProps,
  ModalTitleProps,
} from "../../types/modal";
import { cn } from "../../utils/cn";
import "./styles/modal.css";

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalPortal = DialogPrimitive.Portal;
export const ModalClose = DialogPrimitive.Close;

export const ModalOverlay = forwardRef<HTMLDivElement, ModalOverlayProps>(
  function ModalOverlay({ className, classNames, ...props }, ref) {
    return (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn("gsl-modal__overlay", classNames?.overlay, className)}
        {...props}
      />
    );
  },
);

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent(
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
        className={cn("gsl-modal", classNames?.content, className)}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            type="button"
            className={cn("gsl-modal__close", classNames?.close)}
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={2} aria-hidden />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    );
  },
);

export const ModalHeader = forwardRef<HTMLElement, ModalHeaderProps>(
  function ModalHeader({ className, classNames, ...props }, ref) {
    return (
      <header
        ref={ref}
        className={cn("gsl-modal__header", classNames?.header, className)}
        {...props}
      />
    );
  },
);

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  function ModalTitle({ className, classNames, ...props }, ref) {
    return (
      <DialogPrimitive.Title
        ref={ref}
        className={cn("gsl-modal__title", classNames?.title, className)}
        {...props}
      />
    );
  },
);

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(function ModalDescription({ className, classNames, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(
        "gsl-modal__description",
        classNames?.description,
        className,
      )}
      {...props}
    />
  );
});

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  function ModalBody({ className, classNames, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-modal__body", classNames?.body, className)}
        {...props}
      />
    );
  },
);

export const ModalFooter = forwardRef<HTMLElement, ModalFooterProps>(
  function ModalFooter({ className, classNames, ...props }, ref) {
    return (
      <footer
        ref={ref}
        className={cn("gsl-modal__footer", classNames?.footer, className)}
        {...props}
      />
    );
  },
);
