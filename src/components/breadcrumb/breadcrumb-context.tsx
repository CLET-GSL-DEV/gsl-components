import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface BreadcrumbContextValue {
  items: BreadcrumbEntry[];
  setItems: (items: BreadcrumbEntry[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  items: [],
  setItems: () => {},
});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbEntry[]>([]);

  return (
    <BreadcrumbContext.Provider value={{ items, setItems }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

/** Hook for child pages to set the breadcrumb trail. Compares by value to avoid infinite loops. Cleans up on unmount. */
export function useBreadcrumbs(items: BreadcrumbEntry[]) {
  const { setItems } = useContext(BreadcrumbContext);
  const prevKey = useRef("");

  const key = JSON.stringify(items);

  useEffect(() => {
    if (key === prevKey.current) return;
    prevKey.current = key;
    setItems(items);
    return () => {
      setItems([]);
      prevKey.current = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function useBreadcrumbContext() {
  return useContext(BreadcrumbContext);
}
