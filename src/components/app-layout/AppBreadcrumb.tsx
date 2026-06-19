import type { ReactNode } from "react";

export interface AppBreadcrumbProps {
  children?: ReactNode;
  className?: string;
}

export const AppBreadcrumb = ({ children }: AppBreadcrumbProps) => {
  return children as ReactNode;
};

(AppBreadcrumb as any).componentId = "AppBreadcrumb";
