import * as PopoverPrimitive from "@radix-ui/react-popover";
import { forwardRef } from "react";
import type { PopoverContentProps } from "../../types/popover";
import { cn } from "../../utils/cn";
import "./styles/popover.css";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverPortal = PopoverPrimitive.Portal;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

export const PopoverContent = forwardRef<
  HTMLDivElement,
  PopoverContentProps
>(function PopoverContent(
  { className, classNames, children, ...props },
  ref,
) {
  return (
    <PopoverPrimitive.Content
      ref={ref}
      className={cn("clet-popover gsl-popover", classNames?.content, className)}
      {...props}
    >
      {children}
    </PopoverPrimitive.Content>
  );
});
