import type { ReactNode } from "react";
import { withComponentId } from "../../utils/componentId";

export interface AppBodyProps {
  children?: ReactNode;
  className?: string;
}

const AppBodyBase = ({ children }: AppBodyProps) => {
  return children as ReactNode;
};

export const AppBody = /* @__PURE__ */ withComponentId(AppBodyBase, "AppBody");
