import { forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface AppSidebarProps {
  children?: ReactNode;
  className?: string;
}

export const AppSidebar = forwardRef<HTMLElement, AppSidebarProps>(
  function AppSidebar({ children, className }, ref) {
    return <>{children}</>;
  },
);

(AppSidebar as any).componentId = "AppSidebar";
