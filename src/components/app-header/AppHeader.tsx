import type { AppHeaderProps, AppHeaderActionsProps } from "../../types/app-header";
import { cn } from "../../utils/cn";
import "./styles/app-header.css";

export const AppHeader = ({ className, children, ...props }: AppHeaderProps) => {
  return <div className={cn("gsl-app-header", className)} {...props}>{children}</div>;
};

export const AppHeaderActions = ({ className, children, ...props }: AppHeaderActionsProps) => {
  return (
    <div className={cn("gsl-app-header__right", className)} {...props}>
      {children}
    </div>
  );
};

(AppHeader as unknown as { componentId: string }).componentId = "AppHeader";
(AppHeaderActions as unknown as { componentId: string }).componentId = "AppHeaderActions";
