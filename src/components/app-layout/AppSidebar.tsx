import type { ReactNode } from "react";

export interface AppSidebarProps {
  children?: ReactNode;
  className?: string;
}

export const AppSidebar = ({ children }: AppSidebarProps) => {
  return children as ReactNode;
};

(AppSidebar as any).componentId = "AppSidebar";
