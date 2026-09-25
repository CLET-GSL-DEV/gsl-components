import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import type {
  AppHeaderProps,
  AppHeaderActionsProps,
  AppHeaderBrandingProps,
} from "../../types/app-header";
import { cn } from "../../utils/cn";
import { useHasMounted } from "../../hooks/useHasMounted";
import { useSidebarOptional } from "../sidebar/SidebarContext";
import "./styles/app-header.css";

/**
 * Recursively walks a children tree (descending into each element's own
 * props.children) and returns the first element whose component type carries
 * the given componentId. Used to pluck AppSwitcher/ProfilePopover out of
 * AppHeader's children for the collapsed mobile layout, wherever they're
 * nested (e.g. inside AppHeaderActions).
 */
function findByComponentId(
  children: ReactNode,
  id: string,
): ReactElement | null {
  let found: ReactElement | null = null;

  Children.forEach(children, (child) => {
    if (found || !isValidElement(child)) return;

    const childId = (child.type as { componentId?: string })?.componentId;
    if (childId === id) {
      found = child;
      return;
    }

    found = findByComponentId(
      (child.props as { children?: ReactNode })?.children,
      id,
    );
  });

  return found;
}

export const AppHeader = ({
  className,
  children,
  variant = "default",
  ...props
}: AppHeaderProps) => {
  const sidebar = useSidebarOptional();
  // The mobile branch changes DOM structure (not just classNames), so it must
  // wait a render past mount — see useHasMounted — to avoid a hydration
  // mismatch against SSR/static-prerendered (always-desktop) markup.
  const hasMounted = useHasMounted();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { compact, contextVisible } = useHeaderScroll(
    variant === "plain",
    rootRef,
  );
  const headerClassNames = cn(
    "clet-app-header gsl-app-header",
    variant === "plain" && "clet-app-header--plain gsl-app-header--plain",
    variant === "primary" && "clet-app-header--primary gsl-app-header--primary",
    compact && "clet-app-header--compact gsl-app-header--compact",
    contextVisible && "clet-app-header--context-visible gsl-app-header--context-visible",
  );

  if (hasMounted && sidebar?.isMobile) {
    const appSwitcher = findByComponentId(children, "AppSwitcher");
    const profile = findByComponentId(children, "ProfilePopover");

    return (
      <div
        ref={rootRef}
        className={cn(
          headerClassNames,
          "clet-app-header--mobile gsl-app-header--mobile",
          className,
        )}
        {...props}
      >
        <button
          type="button"
          className="clet-app-header__menu-btn gsl-app-header__menu-btn"
          aria-label="Open menu"
          aria-expanded={sidebar.open}
          aria-controls={sidebar.sidebarId}
          onClick={sidebar.toggle}
        >
          <Menu size={20} strokeWidth={1.75} aria-hidden />
        </button>
        <div className="clet-app-header__right gsl-app-header__right">
          {appSwitcher}
          {profile}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn(headerClassNames, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const AppHeaderActions = ({ className, children, ...props }: AppHeaderActionsProps) => {
  return (
    <div className={cn("clet-app-header__right gsl-app-header__right", className)} {...props}>
      {children}
    </div>
  );
};

export const AppHeaderBranding = ({
  className,
  logo,
  title,
  subtitle,
  children,
}: AppHeaderBrandingProps) => {
  return (
    <div className={cn("clet-app-header__branding gsl-app-header__branding", className)}>
      {logo && <span className="clet-app-header__branding-logo gsl-app-header__branding-logo">{logo}</span>}
      {children ?? (
        <span className="clet-app-header__branding-text gsl-app-header__branding-text">
          {title && (
            <span className="clet-app-header__branding-title gsl-app-header__branding-title">{title}</span>
          )}
          {title && subtitle && (
            <span className="clet-app-header__branding-sep gsl-app-header__branding-sep" aria-hidden>
              -
            </span>
          )}
          {subtitle && (
            <span className="clet-app-header__branding-subtitle gsl-app-header__branding-subtitle">{subtitle}</span>
          )}
        </span>
      )}
    </div>
  );
};

(AppHeader as unknown as { componentId: string }).componentId = "AppHeader";
(AppHeaderActions as unknown as { componentId: string }).componentId = "AppHeaderActions";
(AppHeaderBranding as unknown as { componentId: string }).componentId = "AppHeaderBranding";

/**
 * Scroll state for the 2.4 shell. `compact` shrinks the plain header from
 * its tall resting height once scrolled past the very top; `contextVisible`
 * fades the page title context in later, only once scrolled deep enough to
 * have covered the page title itself (past the tall header plus its gap).
 * Listens in the capture phase so scrolls inside inner containers (e.g. the
 * layout body, which owns the page scroll in the default shell) are seen
 * too: those never reach window as bubbled events and leave window.scrollY
 * at 0. Initial state is "at top", so server and first-client renders agree.
 */
const HEADER_CONTEXT_DEPTH = 64;

function useHeaderScroll(
  enabled: boolean,
  rootRef: React.RefObject<HTMLDivElement | null>,
): { compact: boolean; contextVisible: boolean } {
  const [compact, setCompact] = useState(false);
  const [contextVisible, setContextVisible] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const check = () => {
      let depth = window.scrollY;
      let node = rootRef.current?.parentElement ?? null;
      while (node) {
        if (node.scrollTop > depth) depth = node.scrollTop;
        node = node.parentElement;
      }
      setCompact(depth > 0);
      setContextVisible(depth >= HEADER_CONTEXT_DEPTH);
    };
    check();
    window.addEventListener("scroll", check, { capture: true, passive: true });
    return () =>
      window.removeEventListener("scroll", check, { capture: true });
  }, [enabled, rootRef]);

  return { compact, contextVisible };
}
