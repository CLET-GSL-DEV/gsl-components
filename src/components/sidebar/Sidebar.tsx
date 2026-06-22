import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, ChevronDown } from "lucide-react";
import { Tooltip } from "../tooltip/Tooltip";
import type {
  SidebarBadgeProps,
  SidebarBrandProps,
  SidebarCollapseProps,
  SidebarContentProps,
  SidebarFooterProps,
  SidebarGroupLabelProps,
  SidebarGroupProps,
  SidebarHeaderProps,
  SidebarItemProps,
  SidebarLinkProps,
  SidebarNavProps,
  SidebarOverlayProps,
  SidebarProps,
  SidebarTriggerProps,
} from "../../types/sidebar";
import { cn } from "../../utils/cn";
import { useSidebar } from "./SidebarContext";
import "./styles/sidebar.css";

export { SidebarProvider, useSidebar } from "./SidebarContext";

const SidebarLinkContext = createContext(false);

function useSidebarLinkContext() {
  return useContext(SidebarLinkContext);
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { classNames, className, children },
  ref,
) {
  const { open, collapsed, isMobile, sidebarId } = useSidebar();

  return (
    <aside
      ref={ref}
      id={sidebarId}
      className={cn(
        "gsl-sidebar",
        isMobile && "gsl-sidebar--mobile",
        isMobile && open && "gsl-sidebar--mobile-open",
        !isMobile && collapsed && "gsl-sidebar--collapsed",
        classNames?.root,
        className,
      )}
      aria-modal={isMobile && open ? true : undefined}
    >
      {children}
    </aside>
  );
});

export const SidebarOverlay = forwardRef<
  HTMLButtonElement,
  SidebarOverlayProps
>(function SidebarOverlay({ classNames, className, ...props }, ref) {
  const { open, setOpen, isMobile } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "gsl-sidebar__overlay",
        open && "gsl-sidebar__overlay--visible",
        classNames?.overlay,
        className,
      )}
      aria-label="Close sidebar"
      aria-hidden={!open}
      tabIndex={open ? 0 : -1}
      onClick={() => setOpen(false)}
      {...props}
    />
  );
});

export const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(function SidebarTrigger(
  { classNames, className, children, onClick, ...props },
  ref,
) {
  const { open, toggle, isMobile, sidebarId } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn("gsl-sidebar__trigger", classNames?.trigger, className)}
      aria-expanded={open}
      aria-controls={sidebarId}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          toggle();
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
});

export const SidebarCollapse = forwardRef<
  HTMLButtonElement,
  SidebarCollapseProps
>(function SidebarCollapse({ classNames, className, onClick, ...props }, ref) {
  const { collapsed, toggleCollapsed, isMobile, sidebarId } = useSidebar();

  if (isMobile) {
    return null;
  }

  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <button
      ref={ref}
      type="button"
      className={cn("gsl-sidebar__collapse", classNames?.collapse, className)}
      aria-expanded={!collapsed}
      aria-controls={sidebarId}
      aria-label="Toggle sidebar"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          toggleCollapsed();
        }
      }}
      {...props}
    >
      <CollapseIcon aria-hidden="true" size={18} strokeWidth={1.75} />
    </button>
  );
});

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-sidebar__header", classNames?.header, className)}
      >
        {children}
      </div>
    );
  },
);

export const SidebarBrand = forwardRef<HTMLDivElement, SidebarBrandProps>(
  function SidebarBrand({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-sidebar__header-brand", classNames?.root, className)}
      >
        {children}
      </div>
    );
  },
);

export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  function SidebarContent({ classNames, className, children }, ref) {
    const internalRef = useRef<HTMLDivElement>(null);
    const [scrolledDown, setScrolledDown] = useState(false);
    const [showScrollHint, setShowScrollHint] = useState(false);

    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;
      const check = () => {
        const hasOverflow = el.scrollHeight > el.clientHeight + 2;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
        setShowScrollHint(hasOverflow && !atBottom);
        setScrolledDown(el.scrollTop > 60);
      };
      check();
      el.addEventListener("scroll", check, { passive: true });
      return () => el.removeEventListener("scroll", check);
    }, []);

    const handleScrollHint = () => {
      internalRef.current?.scrollBy({ top: 200, behavior: "smooth" });
    };

    // Merge forwarded ref with internal ref
    const setRefs = (node: HTMLDivElement | null) => {
      (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    return (
      <div
        ref={setRefs}
        className={cn(
          "gsl-sidebar__content",
          scrolledDown && "gsl-sidebar__content--scrolled",
          classNames?.content,
          className,
        )}
      >
        {children}
        {showScrollHint && (
          <button
            type="button"
            className="gsl-sidebar__scroll-hint"
            onClick={handleScrollHint}
            aria-label="Scroll for more"
          >
            <ChevronDown size={16} strokeWidth={2} aria-hidden />
          </button>
        )}
      </div>
    );
  },
);

export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-sidebar__footer", classNames?.footer, className)}
      >
        {children}
      </div>
    );
  },
);

export const SidebarNav = forwardRef<HTMLElement, SidebarNavProps>(
  function SidebarNav(
    {
      classNames,
      className,
      children,
      "aria-label": ariaLabel = "Sidebar",
      ...props
    },
    ref,
  ) {
    return (
      <nav
        ref={ref}
        className={cn("gsl-sidebar__nav", classNames?.nav, className)}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </nav>
    );
  },
);

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  function SidebarGroup({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-sidebar__group", classNames?.group, className)}
      >
        {children}
      </div>
    );
  },
);

export const SidebarGroupLabel = forwardRef<
  HTMLParagraphElement,
  SidebarGroupLabelProps
>(function SidebarGroupLabel({ classNames, className, children }, ref) {
  return (
    <p
      ref={ref}
      className={cn(
        "gsl-sidebar__group-label",
        classNames?.groupLabel,
        className,
      )}
    >
      {children}
    </p>
  );
});

export const SidebarItem = forwardRef<HTMLDivElement, SidebarItemProps>(
  function SidebarItem({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-sidebar__item", classNames?.item, className)}
      >
        {children}
      </div>
    );
  },
);

export const SidebarBadge = forwardRef<HTMLSpanElement, SidebarBadgeProps>(
  function SidebarBadge({ classNames, className, children }, ref) {
    const inLink = useSidebarLinkContext();

    if (!inLink) {
      throw new Error("SidebarBadge must be used within a SidebarLink.");
    }

    return (
      <span
        ref={ref}
        className={cn("gsl-sidebar__link-badge", classNames?.badge, className)}
      >
        {children}
      </span>
    );
  },
);

function isSidebarBadgeElement(
  child: ReactNode,
): child is ReactElement<SidebarBadgeProps> {
  return isValidElement(child) && child.type === SidebarBadge;
}

function extractLabelText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractLabelText).join(" ");
  if (isValidElement(node)) {
    return extractLabelText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

export const SidebarLink = forwardRef<HTMLButtonElement | HTMLAnchorElement, SidebarLinkProps>(
  function SidebarLink(
    {
      active = false,
      asChild = false,
      icon,
      to,
      classNames,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const { collapsed } = useSidebar();
    const linkClassName = cn(
      "gsl-sidebar__link",
      active && "gsl-sidebar__link--active",
      classNames?.link,
      className,
    );

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string; role?: string; [key: string]: unknown }>;
      const tooltipText = extractLabelText(children).trim();
      const linkElement = cloneElement(child, {
        ...props,
        role: child.props.role ?? "link",
        className: cn(linkClassName, child.props.className),
      });

      if (collapsed && tooltipText) {
        return (
          <Tooltip content={tooltipText} side="right">
            {linkElement}
          </Tooltip>
        );
      }

      return linkElement;
    }

    const childItems = Children.toArray(children);
    const badgeElement = childItems.find(isSidebarBadgeElement);
    const labelItems = childItems.filter((child) => child !== badgeElement);
    const tooltipText = extractLabelText(labelItems).trim();

    const linkContent = (
      <>
        {icon ? <span className="gsl-sidebar__link-icon">{icon}</span> : null}
        <span className="gsl-sidebar__link-label">{labelItems}</span>
        {badgeElement}
      </>
    );

    const inner = to ? (
      <Link
        to={to}
        className={linkClassName}
        {...(props as Record<string, unknown>)}
      >
        {linkContent}
      </Link>
    ) : (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        role="link"
        className={linkClassName}
        {...props}
      >
        {linkContent}
      </button>
    );

    const wrappedInner = (
      <SidebarLinkContext.Provider value={true}>
        {inner}
      </SidebarLinkContext.Provider>
    );

    const linkWrapper = <span className="gsl-sidebar__link-wrapper">{wrappedInner}</span>;

    if (collapsed && tooltipText) {
      return (
        <Tooltip content={tooltipText} side="right">
          {linkWrapper}
        </Tooltip>
      );
    }

    return linkWrapper;
  },
);
