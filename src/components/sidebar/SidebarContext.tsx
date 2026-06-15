import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SidebarProviderProps } from "../../types/sidebar";
import { cn } from "../../utils/cn";
import { useSidebarMedia } from "./hooks/useSidebarMedia";

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  isMobile: boolean;
  sidebarId: string;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  breakpoint = 768,
  classNames,
  className,
  children,
}: SidebarProviderProps) {
  const sidebarId = useId();
  const isMobile = useSidebarMedia(breakpoint);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultCollapsed);
  const open = openProp ?? uncontrolledOpen;
  const collapsed = collapsedProp ?? uncontrolledCollapsed;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (openProp === undefined) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [onOpenChange, openProp],
  );

  const setCollapsed = useCallback(
    (nextCollapsed: boolean) => {
      if (collapsedProp === undefined) {
        setUncontrolledCollapsed(nextCollapsed);
      }

      onCollapsedChange?.(nextCollapsed);
    },
    [collapsedProp, onCollapsedChange],
  );

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  useEffect(() => {
    if (!isMobile && open) {
      setOpen(false);
    }
  }, [isMobile, open, setOpen]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      collapsed,
      setCollapsed,
      toggleCollapsed,
      isMobile,
      sidebarId,
    }),
    [
      open,
      setOpen,
      toggle,
      collapsed,
      setCollapsed,
      toggleCollapsed,
      isMobile,
      sidebarId,
    ],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className={cn(classNames?.root, className)}>{children}</div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}
