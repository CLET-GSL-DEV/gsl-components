import type { ReactNode } from "react";

export interface AppBodyProps {
  children?: ReactNode;
  className?: string;
}

export const AppBody = ({ children }: AppBodyProps) => {
  return children as ReactNode;
};

(AppBody as any).componentId = "AppBody";
