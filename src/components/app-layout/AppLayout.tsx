import {
  Children,
  isValidElement,
  forwardRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { BreadcrumbProvider } from "../breadcrumb/breadcrumb-context";
import { SidebarProvider } from "../sidebar/SidebarContext";
import { AppLayoutInner } from "./AppLayoutInner";

export interface AppLayoutProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Application layout that internally wraps children with BreadcrumbProvider
 * and SidebarProvider. Auto-positions AppHeader, AppSidebar, and AppBody
 * by componentId. Breadcrumbs render automatically from context.
 */
export const AppLayout = forwardRef<HTMLDivElement, AppLayoutProps>(
  function AppLayout({ children, className }, ref) {
    return (
      <BreadcrumbProvider>
        <SidebarProvider>
          <AppLayoutInner className={className} ref={ref}>
            {children}
          </AppLayoutInner>
        </SidebarProvider>
      </BreadcrumbProvider>
    );
  },
);
