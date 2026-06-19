import {
  Children,
  isValidElement,
  forwardRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import "./styles/app-layout.css";

export interface AppLayoutProps {
  children?: ReactNode;
  className?: string;
}

export const AppLayout = forwardRef<HTMLDivElement, AppLayoutProps>(
  function AppLayout({ children, className }, ref) {
    let headerEl: ReactElement | null = null;
    let sidebarEl: ReactElement | null = null;
    let breadcrumbEl: ReactElement | null = null;
    let bodyEl: ReactElement | null = null;

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const id = (child.type as any)?.componentId;
      if (id === "AppHeader") {
        headerEl = child;
      } else if (id === "AppSidebar") {
        sidebarEl = child;
      } else if (id === "AppBreadcrumb") {
        breadcrumbEl = child;
      } else if (id === "AppBody") {
        bodyEl = child;
      }
    });

    const extractProps = (el: ReactElement | null) => {
      if (!el) return { className: undefined, children: null, rest: {} };
      const { className: childClassName, children: childChildren, ...rest } = el.props as Record<string, unknown>;
      return { className: childClassName as string | undefined, children: childChildren as ReactNode, rest };
    };

    const header = extractProps(headerEl);
    const breadcrumb = extractProps(breadcrumbEl);
    const sidebar = extractProps(sidebarEl);
    const body = extractProps(bodyEl);

    return (
      <div ref={ref} className={cn("gsl-app-layout", className)}>
        {sidebarEl && (
          <div className={cn("gsl-app-layout__sidebar", sidebar.className)} {...sidebar.rest}>
            {sidebar.children}
          </div>
        )}
        <div className="gsl-app-layout__body">
          {headerEl && (
            <div className={cn("gsl-app-layout__header", header.className)} {...header.rest}>
              {header.children}
            </div>
          )}
          {breadcrumbEl && breadcrumb.children != null && breadcrumb.children !== false && (
            <div className={cn("gsl-app-layout__breadcrumb", breadcrumb.className)} {...breadcrumb.rest}>
              {breadcrumb.children}
            </div>
          )}
          {bodyEl && (
            <div className={cn("gsl-app-layout__content", body.className)} {...body.rest}>
              {body.children}
            </div>
          )}
        </div>
      </div>
    );
  },
);
