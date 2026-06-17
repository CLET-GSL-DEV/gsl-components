import {
  Children,
  cloneElement,
  isValidElement,
  forwardRef,
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
    let header: ReactNode = null;
    let sidebar: ReactNode = null;
    let body: ReactNode = null;

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const id = (child.type as any)?.componentId;
      if (id === "AppHeader") {
        header = child;
      } else if (id === "AppSidebar") {
        sidebar = child;
      } else if (id === "AppBody") {
        body = child;
      }
    });

    return (
      <div ref={ref} className={cn("gsl-app-layout", className)}>
        {sidebar && <div className="gsl-app-layout__sidebar">{sidebar}</div>}
        <div className="gsl-app-layout__body">
          {header && <div className="gsl-app-layout__header">{header}</div>}
          {body && <div className="gsl-app-layout__content">{body}</div>}
        </div>
      </div>
    );
  },
);
