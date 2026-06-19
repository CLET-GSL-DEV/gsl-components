import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";
import { forwardRef, useCallback, useRef, useState } from "react";
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
import { Button } from "../button/Button";
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
      size = "lg",
      preventClose = false,
      preventCloseTitle = "Discard changes?",
      preventCloseDescription = "You have unsaved changes. Are you sure you want to close?",
      ...props
    },
    ref,
  ) {
    const [showConfirm, setShowConfirm] = useState(false);
    const hiddenCloseRef = useRef<HTMLButtonElement>(null);

    const requestClose = useCallback(() => {
      setShowConfirm(true);
    }, []);

    const handleInteractOutside = useCallback(
      (event: Event) => {
        if (preventClose) {
          event.preventDefault();
          requestClose();
        }
      },
      [preventClose, requestClose],
    );

    const handleEscapeKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (preventClose) {
          event.preventDefault();
          requestClose();
        }
      },
      [preventClose, requestClose],
    );

    return (
      <>
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "gsl-modal",
            `gsl-modal--${size}`,
            classNames?.content,
            className,
          )}
          onInteractOutside={preventClose ? handleInteractOutside : undefined}
          onEscapeKeyDown={preventClose ? handleEscapeKeyDown : undefined}
          {...props}
        >
          {children}
          {showCloseButton ? (
            preventClose ? (
              <button
                type="button"
                className={cn("gsl-modal__close", classNames?.close)}
                aria-label="Close modal"
                onClick={requestClose}
              >
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
            ) : (
              <DialogPrimitive.Close
                type="button"
                className={cn("gsl-modal__close", classNames?.close)}
                aria-label="Close modal"
              >
                <X size={16} strokeWidth={2} aria-hidden />
              </DialogPrimitive.Close>
            )
          ) : null}
          <DialogPrimitive.Close
            ref={hiddenCloseRef}
            style={{ display: "none" }}
            aria-hidden
          />
        </DialogPrimitive.Content>

        <AlertDialog.Root open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="gsl-modal__confirm-overlay" />
            <AlertDialog.Content className="gsl-modal__confirm">
              <AlertDialog.Title className="gsl-modal__confirm-title">
                {preventCloseTitle}
              </AlertDialog.Title>
              <AlertDialog.Description className="gsl-modal__confirm-description">
                {preventCloseDescription}
              </AlertDialog.Description>
              <div className="gsl-modal__confirm-actions">
                <AlertDialog.Cancel asChild>
                  <Button variant="outline">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowConfirm(false);
                      hiddenCloseRef.current?.click();
                    }}
                  >
                    Discard
                  </Button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </>
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
