import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";
import type {
  SheetBodyProps,
  SheetContentProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetOverlayProps,
  SheetSide,
  SheetTitleProps,
} from "../../types/sheet";
import { cn } from "../../utils/cn";
import "./styles/sheet.css";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetPortal = DialogPrimitive.Portal;
export const SheetClose = DialogPrimitive.Close;

function getSideClassName(side: SheetSide) {
  return `gsl-sheet--${side}`;
}

export const SheetOverlay = forwardRef<HTMLDivElement, SheetOverlayProps>(
  function SheetOverlay({ className, classNames, ...props }, ref) {
    return (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn("gsl-sheet__overlay", classNames?.overlay, className)}
        {...props}
      />
    );
  },
);

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  function SheetContent(
    {
      className,
      classNames,
      children,
      showCloseButton = false,
      side = "right",
      ...props
    },
    ref,
  ) {
    return (
      <DialogPrimitive.Content
        ref={ref}
        data-side={side}
        className={cn(
          "gsl-sheet",
          getSideClassName(side),
          classNames?.content,
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            type="button"
            className={cn("gsl-sheet__close", classNames?.close)}
            aria-label="Close sheet"
          >
            <X size={16} strokeWidth={2} aria-hidden />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    );
  },
);

export const SheetHeader = forwardRef<HTMLElement, SheetHeaderProps>(
  function SheetHeader({ className, classNames, ...props }, ref) {
    return (
      <header
        ref={ref}
        className={cn("gsl-sheet__header", classNames?.header, className)}
        {...props}
      />
    );
  },
);

export const SheetTitle = forwardRef<HTMLHeadingElement, SheetTitleProps>(
  function SheetTitle({ className, classNames, ...props }, ref) {
    return (
      <DialogPrimitive.Title
        ref={ref}
        className={cn("gsl-sheet__title", classNames?.title, className)}
        {...props}
      />
    );
  },
);

export const SheetDescription = forwardRef<
  HTMLParagraphElement,
  SheetDescriptionProps
>(function SheetDescription({ className, classNames, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(
        "gsl-sheet__description",
        classNames?.description,
        className,
      )}
      {...props}
    />
  );
});

export const SheetBody = forwardRef<HTMLDivElement, SheetBodyProps>(
  function SheetBody({ className, classNames, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-sheet__body", classNames?.body, className)}
        {...props}
      />
    );
  },
);

export const SheetFooter = forwardRef<HTMLElement, SheetFooterProps>(
  function SheetFooter({ className, classNames, ...props }, ref) {
    return (
      <footer
        ref={ref}
        className={cn("gsl-sheet__footer", classNames?.footer, className)}
        {...props}
      />
    );
  },
);
