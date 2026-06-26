import { cloneElement, forwardRef, isValidElement, useCallback, useRef, useState, type ReactElement, type Ref } from "react";
import { createPortal } from "react-dom";
import type { TooltipProps } from "../../types/tooltip";
import { cn } from "../../utils/cn";
import "./styles/tooltip.css";

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(
    { content, side = "top", classNames, className, children },
    ref,
  ) {
    const triggerRef = useRef<HTMLElement | null>(null);
    const contentRef = useRef<HTMLSpanElement | null>(null);
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const show = useCallback(() => {
      clearTimeout(timeoutRef.current);
      setOpen(true);
    }, []);

    const hide = useCallback(() => {
      timeoutRef.current = setTimeout(() => setOpen(false), 80);
    }, []);

    const position = useCallback(() => {
      const trigger = triggerRef.current;
      const el = contentRef.current;
      if (!trigger || !el) return;

      const rect = trigger.getBoundingClientRect();
      el.style.top = "";
      el.style.bottom = "";
      el.style.left = "";
      el.style.right = "";
      el.style.transform = "";

      const gap = 6;

      switch (side) {
        case "top":
          el.style.bottom = `${window.innerHeight - rect.top + gap}px`;
          el.style.left = `${rect.left + rect.width / 2}px`;
          el.style.transform = "translateX(-50%)";
          break;
        case "bottom":
          el.style.top = `${rect.bottom + gap}px`;
          el.style.left = `${rect.left + rect.width / 2}px`;
          el.style.transform = "translateX(-50%)";
          break;
        case "left":
          el.style.right = `${window.innerWidth - rect.left + gap}px`;
          el.style.top = `${rect.top + rect.height / 2}px`;
          el.style.transform = "translateY(-50%)";
          break;
        case "right":
          el.style.left = `${rect.right + gap}px`;
          el.style.top = `${rect.top + rect.height / 2}px`;
          el.style.transform = "translateY(-50%)";
          break;
      }
    }, [side]);

    const handleMouseEnter = useCallback(() => {
      show();
      requestAnimationFrame(() => requestAnimationFrame(position));
    }, [show, position]);

    interface ChildProps {
      ref?: Ref<HTMLElement>;
      onMouseEnter?: (e: React.MouseEvent) => void;
      onMouseLeave?: (e: React.MouseEvent) => void;
      onFocus?: (e: React.FocusEvent) => void;
      onBlur?: (e: React.FocusEvent) => void;
    }

    const child = isValidElement(children)
      ? (children as ReactElement<ChildProps>)
      : null;

    const trigger = child
      ? cloneElement(child, {
          ref: (node: HTMLElement | null) => {
            triggerRef.current = node;
            const childRef = child.props.ref;
            if (typeof childRef === "function") childRef(node);
            else if (childRef) (childRef as { current: HTMLElement | null }).current = node;
          },
          onMouseEnter: (e: React.MouseEvent) => {
            child.props.onMouseEnter?.(e);
            handleMouseEnter();
          },
          onMouseLeave: (e: React.MouseEvent) => {
            child.props.onMouseLeave?.(e);
            hide();
          },
          onFocus: (e: React.FocusEvent) => {
            child.props.onFocus?.(e);
            handleMouseEnter();
          },
          onBlur: (e: React.FocusEvent) => {
            child.props.onBlur?.(e);
            hide();
          },
        })
      : null;

    return (
      <div
        ref={ref}
        className={cn(
          "gsl-tooltip",
          `gsl-tooltip--${side}`,
          classNames?.root,
          className,
        )}
      >
        {trigger}
        {createPortal(
          <span
            ref={contentRef}
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
            <span className="gsl-tooltip__arrow" />
          </span>,
          document.body,
        )}
      </div>
    );
  },
);
