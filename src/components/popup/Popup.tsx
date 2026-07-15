import * as PopoverPrimitive from "@radix-ui/react-popover";
import { X } from "lucide-react";
import { forwardRef } from "react";
import type {
  PopupBodyProps,
  PopupContentProps,
  PopupDescriptionProps,
  PopupFooterProps,
  PopupHeaderProps,
  PopupTitleProps,
} from "../../types/popup";
import { cn } from "../../utils/cn";
import "./styles/popup.css";

export const Popup = PopoverPrimitive.Root;
export const PopupTrigger = PopoverPrimitive.Trigger;
export const PopupPortal = PopoverPrimitive.Portal;
export const PopupAnchor = PopoverPrimitive.Anchor;
export const PopupClose = PopoverPrimitive.Close;

export const PopupContent = forwardRef<HTMLDivElement, PopupContentProps>(
  function PopupContent(
    {
      className,
      classNames,
      children,
      showCloseButton = false,
      sideOffset = 8,
      ...props
    },
    ref,
  ) {
    return (
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn("clet-popup gsl-popup", classNames?.content, className)}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <PopoverPrimitive.Close
            type="button"
            className={cn("clet-popup__close gsl-popup__close", classNames?.close)}
            aria-label="Close"
          >
            <X size={14} strokeWidth={2} aria-hidden />
          </PopoverPrimitive.Close>
        ) : null}
      </PopoverPrimitive.Content>
    );
  },
);

export const PopupHeader = forwardRef<HTMLDivElement, PopupHeaderProps>(
  function PopupHeader({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-popup__header gsl-popup__header", classNames?.header, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const PopupTitle = forwardRef<HTMLHeadingElement, PopupTitleProps>(
  function PopupTitle({ className, classNames, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn("clet-popup__title gsl-popup__title", classNames?.title, className)}
        {...props}
      />
    );
  },
);

export const PopupDescription = forwardRef<
  HTMLParagraphElement,
  PopupDescriptionProps
>(function PopupDescription({ className, classNames, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn(
        "clet-popup__description gsl-popup__description",
        classNames?.description,
        className,
      )}
      {...props}
    />
  );
});

export const PopupBody = forwardRef<HTMLDivElement, PopupBodyProps>(
  function PopupBody({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-popup__body gsl-popup__body", classNames?.body, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const PopupFooter = forwardRef<HTMLDivElement, PopupFooterProps>(
  function PopupFooter(
    { className, classNames, layout = "row", children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "clet-popup__footer gsl-popup__footer",
          `clet-popup__footer--${layout} gsl-popup__footer--${layout}`,
          classNames?.footer,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
