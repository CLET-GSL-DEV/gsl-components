import {
  Children,
  isValidElement,
  forwardRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { useBreadcrumbContext } from "../breadcrumb/breadcrumb-context";
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../breadcrumb/Breadcrumb";
import "./styles/app-layout.css";

export interface AppLayoutInnerProps {
  children?: ReactNode;
  className?: string;
}

export const AppLayoutInner = forwardRef<HTMLDivElement, AppLayoutInnerProps>(
  function AppLayoutInner({ children, className }, ref) {
    const { items } = useBreadcrumbContext();

    let headerEl: ReactElement | null = null;
    let sidebarEl: ReactElement | null = null;
    let bodyEl: ReactElement | null = null;

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const id = (child.type as { componentId?: string })?.componentId;
      if (id === "AppHeader") {
        headerEl = child;
      } else if (id === "AppSidebar") {
        sidebarEl = child;
      } else if (id === "AppBody") {
        bodyEl = child;
      }
    });

    const extractProps = (el: ReactElement | null) => {
      if (!el) return { className: undefined, children: null, rest: {} };
      const { className: childClassName, children: childChildren, ...rest } = el.props as Record<string, unknown>;
      return { className: childClassName as string | undefined, children: childChildren as ReactNode, rest };
    };

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
          {headerEl}
          {items.length > 0 && (
            <div className="gsl-app-layout__breadcrumb">
              <Breadcrumb>
                <BreadcrumbList>
                  {items.flatMap((item, i) => [
                    i > 0 && <BreadcrumbSeparator key={`sep-${i}`} />,
                    <BreadcrumbItem key={i}>
                      {item.href ? (
                        <Link to={item.href} className="gsl-breadcrumb__link">
                          {item.label}
                        </Link>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>,
                  ])}
                </BreadcrumbList>
              </Breadcrumb>
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
