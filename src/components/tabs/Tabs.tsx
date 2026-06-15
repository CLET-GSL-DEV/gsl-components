import * as TabsPrimitive from "@radix-ui/react-tabs";
import { forwardRef, useRef } from "react";
import type {
  TabsContentProps,
  TabsListProps,
  TabsProps,
  TabsTriggerProps,
} from "../../types/tabs";
import { cn } from "../../utils/cn";
import { useTabsLineIndicator } from "./hooks/useTabsLineIndicator";
import { TabsProvider, useTabsContext } from "./TabsContext";
import "./styles/tabs.css";

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    variant = "default",
    classNames,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <TabsProvider variant={variant}>
      <TabsPrimitive.Root
        ref={ref}
        className={cn(
          "gsl-tabs",
          variant === "line" ? "gsl-tabs--line" : "gsl-tabs--default",
          classNames?.root,
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsProvider>
  );
});

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ classNames, className, children, ...props }, ref) {
    const { variant } = useTabsContext();
    const listRef = useRef<HTMLDivElement | null>(null);
    const isLineVariant = variant === "line";
    const { style: indicatorStyle, visible: indicatorVisible } =
      useTabsLineIndicator(listRef, isLineVariant);

    return (
      <TabsPrimitive.List
        ref={(node) => {
          listRef.current = node;

          if (typeof ref === "function") {
            ref(node);
            return;
          }

          if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "gsl-tabs__list",
          isLineVariant ? "gsl-tabs__list--line" : "gsl-tabs__list--default",
          classNames?.list,
          className,
        )}
        {...props}
      >
        {children}
        {isLineVariant ? (
          <span
            className={cn("gsl-tabs__indicator", classNames?.indicator)}
            aria-hidden
            hidden={!indicatorVisible}
            style={indicatorStyle}
          />
        ) : null}
      </TabsPrimitive.List>
    );
  },
);

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ classNames, className, ...props }, ref) {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn("gsl-tabs__trigger", classNames?.trigger, className)}
        {...props}
      />
    );
  },
);

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ classNames, className, ...props }, ref) {
    return (
      <TabsPrimitive.Content
        ref={ref}
        className={cn("gsl-tabs__content", classNames?.content, className)}
        {...props}
      />
    );
  },
);
