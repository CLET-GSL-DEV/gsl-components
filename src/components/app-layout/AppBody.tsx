import { forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface AppBodyProps {
  children?: ReactNode;
  className?: string;
}

export const AppBody = forwardRef<HTMLElement, AppBodyProps>(
  function AppBody({ children, className }, ref) {
    return (
      <main ref={ref} className={cn("gsl-app-body", className)}>
        {children}
      </main>
    );
  },
);

(AppBody as any).componentId = "AppBody";
