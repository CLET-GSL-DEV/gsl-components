import * as PopoverPrimitive from "@radix-ui/react-popover";
import { forwardRef, useCallback, useRef, useState } from "react";
import type { TooltipProps } from "../../types/tooltip";
import { cn } from "../../utils/cn";
import "./styles/tooltip.css";

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(
    { content, side = "top", classNames, className, children },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const show = useCallback(() => {
      clearTimeout(timeoutRef.current);
      setOpen(true);
    }, []);

    const hide = useCallback(() => {
      timeoutRef.current = setTimeout(() => setOpen(false), 80);
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          "gsl-tooltip",
          classNames?.root,
          className,
        )}
      >
        <PopoverPrimitive.Root open={open}>
          <PopoverPrimitive.Trigger
            asChild
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
          >
            {children}
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              side={side}
              sideOffset={4}
              className={cn(
                "gsl-tooltip__content",
                `gsl-tooltip__content--${side}`,
                open && "gsl-tooltip__content--open",
                classNames?.content,
              )}
              role="tooltip"
              onMouseEnter={show}
              onMouseLeave={hide}
            >
              {content}
              <PopoverPrimitive.Arrow
                className="gsl-tooltip__arrow"
                width={8}
                height={4}
              />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </div>
    );
  },
);
