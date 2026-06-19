import type { ReactNode } from "react";
import type { AppHeaderProps, AppHeaderActionsProps } from "../../types/app-header";
import { cn } from "../../utils/cn";
import "./styles/app-header.css";

export const AppHeader = ({ children }: AppHeaderProps) => {
  return children as ReactNode;
};

export const AppHeaderActions = ({ className, children, ...props }: AppHeaderActionsProps) => {
  return (
    <div className={cn("gsl-app-header__right", className)} {...props}>
      {children}
    </div>
  );
};

(AppHeader as any).componentId = "AppHeader";
(AppHeaderActions as any).componentId = "AppHeaderActions";
