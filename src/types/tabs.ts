import type * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ReactNode } from "react";

export type TabsVariant = "default" | "pill" | "line";

export interface TabsClassNames {
  root?: string;
}

export interface TabsListClassNames {
  list?: string;
  indicator?: string;
}

export interface TabsTriggerClassNames {
  trigger?: string;
}

export interface TabsContentClassNames {
  content?: string;
}

export interface TabsProps extends Omit<TabsPrimitive.TabsProps, "className"> {
  variant?: TabsVariant;
  classNames?: TabsClassNames;
  className?: string;
  children: ReactNode;
}

export interface TabsListProps extends Omit<
  TabsPrimitive.TabsListProps,
  "className"
> {
  classNames?: TabsListClassNames;
  className?: string;
}

export interface TabsTriggerProps extends Omit<
  TabsPrimitive.TabsTriggerProps,
  "className"
> {
  classNames?: TabsTriggerClassNames;
  className?: string;
}

export interface TabsContentProps extends Omit<
  TabsPrimitive.TabsContentProps,
  "className"
> {
  classNames?: TabsContentClassNames;
  className?: string;
}
