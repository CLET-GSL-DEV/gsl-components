import { createContext, useContext, type ReactNode } from "react";
import type { TabsVariant } from "../../types/tabs";

interface TabsContextValue {
  variant: TabsVariant;
}

const TabsContext = createContext<TabsContextValue>({
  variant: "default",
});

export function TabsProvider({
  variant,
  children,
}: {
  variant: TabsVariant;
  children: ReactNode;
}) {
  return (
    <TabsContext.Provider value={{ variant }}>{children}</TabsContext.Provider>
  );
}

export function useTabsContext() {
  return useContext(TabsContext);
}
