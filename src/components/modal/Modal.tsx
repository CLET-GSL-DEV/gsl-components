import * as DialogPrimitive from "@radix-ui/react-dialog";
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
import { useComposedRefs } from "../../hooks";

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
      onOpenChange,
      ...props
    },
    ref,
  ) {
    const [showConfirm, setShowConfirm] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, contentRef);

    const requestClose = useCallback(() => {
      if (preventClose) {
        setShowConfirm(true);
      } else {
        onOpenChange?.(false);
      }
    }, [preventClose, onOpenChange]);

    const handleDiscard = () => {
      setShowConfirm(false);
      onOpenChange?.(false);
    };

    const handleEscapeKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (preventClose) {
          event.preventDefault();
          requestClose();
        }
      },
      [preventClose, requestClose],
    );

    const handleInteractOutside = useCallback(
      (event: Event) => {
        if (preventClose) {
          event.preventDefault();
          requestClose();
        } else {
          const typedEvent = event as CustomEvent<{
            originalEvent: PointerEvent;
          }>;
          const targetElement = document.elementFromPoint(
            typedEvent.detail.originalEvent.clientX,
            typedEvent.detail.originalEvent.clientY,
          );

          const isTargetInside = contentRef.current?.contains(targetElement);
          if (isTargetInside) {
            event.preventDefault();
          }
          debugger;
        }
      },
      [preventClose, requestClose, handleDiscard, contentRef],
    );

    return (
      <DialogPrimitive.Content
        ref={composedRef}
        className={cn(
          "gsl-modal",
          `gsl-modal--${size}`,
          classNames?.content,
          className,
        )}
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={preventClose ? handleEscapeKeyDown : undefined}
        {...props}
      >
        {children}

        {showCloseButton &&
          (preventClose ? (
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
          ))}

        {showConfirm && (
          <div className="gsl-modal__confirm-overlay">
            <div className="gsl-modal__confirm">
              <h2 className="gsl-modal__confirm-title">{preventCloseTitle}</h2>
              <p className="gsl-modal__confirm-description">
                {preventCloseDescription}
              </p>
              <div className="gsl-modal__confirm-actions">
                <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleDiscard}>
                  Discard
                </Button>
              </div>
            </div>
          </div>
        )}
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
