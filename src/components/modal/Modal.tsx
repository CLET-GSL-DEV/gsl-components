import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
        className={cn("clet-modal__overlay", classNames?.overlay, className)}
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
      onInteractOutside: consumerOnInteractOutside,
      onEscapeKeyDown: consumerOnEscapeKeyDown,
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
      }
    }, [preventClose]);

    const handleDiscard = useCallback(() => {
      setShowConfirm(false);
    }, []);

    const handleCancelConfirm = useCallback(() => {
      setShowConfirm(false);
    }, []);

    const handleEscapeKeyDown = useCallback(
      (event: KeyboardEvent) => {
        event.preventDefault();
        requestClose();
        consumerOnEscapeKeyDown?.(event);
      },
      [requestClose, consumerOnEscapeKeyDown],
    );

    const handleInteractOutsideDefault = useCallback(
      (event: Event) => {
        const typedEvent = event as CustomEvent<{
          originalEvent: PointerEvent;
        }>;
        try {
          const targetElement = document.elementFromPoint(
            typedEvent.detail.originalEvent.clientX,
            typedEvent.detail.originalEvent.clientY,
          );
          const isTargetInside = contentRef.current?.contains(targetElement);
          if (isTargetInside) {
            event.preventDefault();
          } else {
            if (preventClose) {
              event.preventDefault();
              requestClose();
            }
          }
        } catch {
          // jsdom doesn't support elementFromPoint
        }
        (consumerOnInteractOutside as ((e: Event) => void) | undefined)?.(
          event,
        );
      },
      [consumerOnInteractOutside, preventClose, requestClose],
    );

    const confirmNode = useMemo(
      () =>
        createPortal(
          <div className="clet-modal__confirm-overlay">
            <div className="clet-modal__confirm">
              <h2 className="clet-modal__confirm-title">{preventCloseTitle}</h2>
              <p className="clet-modal__confirm-description">
                {preventCloseDescription}
              </p>
              <div className="clet-modal__confirm-actions">
                <Button variant="ghost" onClick={handleCancelConfirm}>
                  Cancel
                </Button>
                <DialogPrimitive.Close asChild onClick={handleDiscard}>
                  <Button variant="primary">Discard</Button>
                </DialogPrimitive.Close>
              </div>
            </div>
          </div>,
          document.body,
        ),
      [
        preventCloseDescription,
        preventCloseTitle,
        handleCancelConfirm,
        handleDiscard,
      ],
    );

    return (
      <DialogPrimitive.Content
        ref={composedRef}
        className={cn(
          "clet-modal",
          `clet-modal--${size}`,
          classNames?.content,
          className,
        )}
        onInteractOutside={handleInteractOutsideDefault}
        onEscapeKeyDown={
          preventClose ? handleEscapeKeyDown : consumerOnEscapeKeyDown
        }
        {...props}
      >
        {children}

        {showCloseButton &&
          (preventClose ? (
            <button
              type="button"
              className={cn("clet-modal__close", classNames?.close)}
              aria-label="Close modal"
              onClick={requestClose}
            >
              <X size={16} strokeWidth={2} aria-hidden />
            </button>
          ) : (
            <DialogPrimitive.Close
              type="button"
              className={cn("clet-modal__close", classNames?.close)}
              aria-label="Close modal"
            >
              <X size={16} strokeWidth={2} aria-hidden />
            </DialogPrimitive.Close>
          ))}

        {showConfirm && confirmNode}
      </DialogPrimitive.Content>
    );
  },
);

export const ModalHeader = forwardRef<HTMLElement, ModalHeaderProps>(
  function ModalHeader({ className, classNames, ...props }, ref) {
    return (
      <header
        ref={ref}
        className={cn("clet-modal__header", classNames?.header, className)}
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
        className={cn("clet-modal__title", classNames?.title, className)}
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
        "clet-modal__description",
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
        className={cn("clet-modal__body", classNames?.body, className)}
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
        className={cn("clet-modal__footer", classNames?.footer, className)}
        {...props}
      />
    );
  },
);
