import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { X } from "lucide-react";
import type { BannerProps } from "../../types/banner";
import { cn } from "../../utils/cn";
import "./styles/banner.css";

const EXPAND_MS = 280;
const COLLAPSE_MS = 220;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Web Animations available, and the reader has not asked for less motion. */
function canAnimate(el: HTMLElement): boolean {
  if (typeof el.animate !== "function") return false;
  return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Page-level banner that persists until dismissed. Full width, sits at the
 * top of a page or under a section heading. Replaces `Notice`.
 */
export const Banner = /* @__PURE__ */ forwardRef<HTMLDivElement, BannerProps>(
  function Banner(
    {
      variant = "info",
      appearance = "outlined",
      heading,
      subtext,
      expandLabel = "Read more",
      collapseLabel = "Show less",
      action,
      onClose,
      closeLabel = "Dismiss",
      classNames,
      className,
      role,
      ...props
    },
    ref,
  ) {
    const subtextRef = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [overflowing, setOverflowing] = useState(false);
    // Height of the clamped subtext, captured on expand so collapse can
    // animate back to it; and the height an expand starts from.
    const collapsedHeight = useRef(0);
    const expandFrom = useRef<number | null>(null);

    const expand = () => {
      const el = subtextRef.current;
      if (el) {
        collapsedHeight.current = el.getBoundingClientRect().height;
        expandFrom.current = collapsedHeight.current;
      }
      setExpanded(true);
    };

    // Expand: the clamp is already gone, so grow from the clamped height
    // to the full text. Overflow is hidden only while it runs.
    useLayoutEffect(() => {
      const el = subtextRef.current;
      const from = expandFrom.current;
      expandFrom.current = null;
      if (!el || from === null || !expanded || !canAnimate(el)) return;

      el.style.overflow = "hidden";
      const animation = el.animate(
        [{ height: `${from}px` }, { height: `${el.scrollHeight}px` }],
        { duration: EXPAND_MS, easing: EASING },
      );
      animation.onfinish = animation.oncancel = () => {
        el.style.overflow = "";
      };
    }, [expanded]);

    // Collapse: shrink the full text back to the clamped height first, and
    // only then restore the clamp, so lines are never cut mid-animation.
    const collapse = () => {
      const el = subtextRef.current;
      if (!el || !canAnimate(el)) {
        setExpanded(false);
        return;
      }

      el.style.overflow = "hidden";
      const animation = el.animate(
        [
          { height: `${el.getBoundingClientRect().height}px` },
          { height: `${collapsedHeight.current}px` },
        ],
        { duration: COLLAPSE_MS, easing: EASING, fill: "forwards" },
      );
      animation.onfinish = () => {
        flushSync(() => setExpanded(false));
        animation.cancel();
        el.style.overflow = "";
      };
    };

    // The subtext is clamped to two lines; the toggle exists only when the
    // clamp actually hides something. Re-measured as the banner resizes.
    // While expanded the answer is already known, so nothing is measured.
    useEffect(() => {
      const el = subtextRef.current;
      if (!el || expanded) return;

      const measure = () => setOverflowing(el.scrollHeight - el.clientHeight > 1);
      measure();

      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }, [subtext, expanded]);

    const toggle = (label: string, next: boolean) => (
      <button
        type="button"
        className={cn("clet-banner__more gsl-banner__more", classNames?.more)}
        aria-expanded={expanded}
        onClick={next ? expand : collapse}
      >
        {label}
      </button>
    );

    return (
      <div
        ref={ref}
        role={role ?? (variant === "danger" ? "alert" : "status")}
        className={cn(
          "clet-banner",
          `clet-banner--${variant}`,
          `clet-banner--${appearance}`,
          classNames?.root,
          className,
        )}
        {...props}
      >
        <div className={cn("clet-banner__accent", classNames?.accent)} aria-hidden />
        <div className={cn("clet-banner__content", classNames?.content)}>
          <div className={cn("clet-banner__heading", classNames?.heading)}>
            {heading}
          </div>
          {subtext ? (
            <div className="clet-banner__subtext-row">
              <div
                ref={subtextRef}
                className={cn(
                  "clet-banner__subtext",
                  !expanded && "clet-banner__subtext--clamped",
                  classNames?.subtext,
                )}
              >
                {/* Collapsed, the toggle floats onto the end of the last
                    visible line, so it has to come before the text. */}
                {!expanded && overflowing ? toggle(expandLabel, true) : null}
                {subtext}
                {expanded ? toggle(collapseLabel, false) : null}
              </div>
            </div>
          ) : null}
        </div>
        {action || onClose ? (
          <div className={cn("clet-banner__actions", classNames?.actions)}>
            {action ? (
              <div className={cn("clet-banner__action", classNames?.action)}>
                {action}
              </div>
            ) : null}
            {onClose ? (
              <button
                type="button"
                className={cn("clet-banner__close", classNames?.close)}
                aria-label={closeLabel}
                onClick={onClose}
              >
                <X size={14} strokeWidth={2.5} aria-hidden />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
