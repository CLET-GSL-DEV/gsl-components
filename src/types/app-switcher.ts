import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { RoleSelect } from "../components/role-select/RoleSelect";
import type { RoleSelectProps } from "./role-select";

export interface AppItem {
  /** Unique identifier for the app */
  id: string;
  /** Display name shown below the icon */
  name: string;
  /** Icon as a React node, image URL, or emoji string */
  icon: ReactNode | string;
  /** URL to navigate to when the app is selected */
  href?: string;
  /** Custom click handler (called before navigation if href is set) */
  onClick?: (app: AppItem) => void;
  /** Whether the app is disabled */
  disabled?: boolean;
  /** Optional badge text (e.g. "New") */
  badge?: string;
}

export interface AppSwitcherProps {
  /** Apps to display in the grid */
  apps: AppItem[];
  /** Shows a loading state in the panel instead of the grid */
  loading?: boolean;
  /** Screen reader label while loading */
  loadingLabel?: string;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Called when an app is selected */
  onAppSelect?: (app: AppItem) => void;
  /** Number of columns in the grid (default: 3) */
  columns?: number;
  /** Maximum number of apps rendered in the grid (default: 6) */
  maxItems?: number;
  /** Accessible label for the trigger button */
  triggerLabel?: string;
  /** Custom trigger element (replaces default 9-dot icon) */
  trigger?: ReactNode;
  /** Panel title shown at the top */
  title?: string;
  /** Footer content (e.g. "More from Google" link) */
  footer?: ReactNode;
  /**
   * Extra composable content rendered below the grid — only a
   * `RoleSelect` element is accepted (e.g. a "switch role" control).
   */
  children?: ReactElement<RoleSelectProps, typeof RoleSelect>;
  /** Additional CSS class for the root container */
  className?: string;
  /** Inline styles for the root container */
  style?: CSSProperties;
  /** Placement of the panel relative to trigger */
  placement?: "bottom-end" | "bottom-start" | "bottom";
  /** Whether to close the panel when an app is selected */
  closeOnSelect?: boolean;
}

export interface UseAppSwitcherOptions {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
}

export interface UseAppSwitcherReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
}
