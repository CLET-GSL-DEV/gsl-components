import type { ReactNode } from "react";

export interface TooltipClassNames {
  root?: string;
  content?: string;
}

export interface TooltipProps {
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  classNames?: TooltipClassNames;
  className?: string;
  children: ReactNode;
}
