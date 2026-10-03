import type { ReactNode } from "react";
import { withComponentId } from "../../utils/componentId";

export interface AppSidebarProps {
  children?: ReactNode;
  className?: string;
}

const AppSidebarBase = ({ children }: AppSidebarProps) => {
  return <>{children}</>;
};

export const AppSidebar = /* @__PURE__ */ withComponentId(AppSidebarBase, "AppSidebar");
