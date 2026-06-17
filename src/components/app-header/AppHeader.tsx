import { forwardRef, type ReactNode } from "react";
import type { AppHeaderProps, AppHeaderActionsProps } from "../../types/app-header";
import { cn } from "../../utils/cn";
import "./styles/app-header.css";

export const AppHeader = forwardRef<HTMLDivElement, AppHeaderProps>(
  function AppHeader({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn("gsl-app-header", className)} {...props}>
        {children}
      </div>
    );
  },
);

export const AppHeaderActions = forwardRef<HTMLDivElement, AppHeaderActionsProps>(
  function AppHeaderActions({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={cn("gsl-app-header__right", className)} {...props}>
        {children}
      </div>
    );
  },
);

(AppHeader as any).componentId = "AppHeader";
(AppHeaderActions as any).componentId = "AppHeaderActions";
