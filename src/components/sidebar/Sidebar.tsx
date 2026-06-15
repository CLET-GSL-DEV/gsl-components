import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  type ReactElement,
  type ReactNode,
} from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type {
  SidebarBadgeProps,
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
import { SidebarProvider, useSidebar } from "./SidebarContext";
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

export const SidebarOverlay = forwardRef<HTMLButtonElement, SidebarOverlayProps>(
  function SidebarOverlay({ classNames, className, ...props }, ref) {
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
  },
);

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger(
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
  },
);

export const SidebarCollapse = forwardRef<
  HTMLButtonElement,
  SidebarCollapseProps
>(function SidebarCollapse(
  { classNames, className, onClick, ...props },
  ref,
) {
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

export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  function SidebarContent({ classNames, className, children }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-sidebar__content", classNames?.content, className)}
      >
        {children}
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
    { classNames, className, children, "aria-label": ariaLabel = "Sidebar", ...props },
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
        className={cn(
          "gsl-sidebar__link-badge",
          classNames?.badge,
          className,
        )}
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

export const SidebarLink = forwardRef<HTMLAnchorElement, SidebarLinkProps>(
  function SidebarLink(
    {
      active = false,
      asChild = false,
      icon,
      classNames,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const linkClassName = cn(
      "gsl-sidebar__link",
      active && "gsl-sidebar__link--active",
      classNames?.link,
      className,
    );

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;

      return cloneElement(child, {
        ...props,
        className: cn(linkClassName, child.props.className),
      });
    }

    const childItems = Children.toArray(children);
    const badgeElement = childItems.find(isSidebarBadgeElement);
    const labelItems = childItems.filter((child) => child !== badgeElement);

    return (
      <SidebarLinkContext.Provider value={true}>
        <a ref={ref} className={linkClassName} {...props}>
          {icon ? (
            <span className="gsl-sidebar__link-icon">{icon}</span>
          ) : null}
          <span className="gsl-sidebar__link-label">{labelItems}</span>
          {badgeElement}
        </a>
      </SidebarLinkContext.Provider>
    );
  },
);
