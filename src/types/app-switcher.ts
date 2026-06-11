import type { CSSProperties, ReactNode } from "react";

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
  /** Original API payload when loaded from `/v1/me/apps` */
  metadata?: MeApp;
}

export interface MeApp {
  system_id: string;
  system_name: string;
  system_code: string;
  frontend_url: string;
  role: string;
  permissions: string[];
}

export interface MeAppsResponse {
  success: boolean;
  message: string;
  data: {
    apps: MeApp[];
  };
  meta: {
    count: number;
  };
}

export interface AppSwitcherBaseProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Called when an app is selected */
  onAppSelect?: (app: AppItem) => void;
  /** Number of columns in the grid (default: 3) */
  columns?: number;
  /** Accessible label for the trigger button */
  triggerLabel?: string;
  /** Custom trigger element (replaces default 9-dot icon) */
  trigger?: ReactNode;
  /** Panel title shown at the top */
  title?: string;
  /** Footer content (e.g. "More from Google" link) */
  footer?: ReactNode;
  /** Additional CSS class for the root container */
  className?: string;
  /** Inline styles for the root container */
  style?: CSSProperties;
  /** Placement of the panel relative to trigger */
  placement?: "bottom-end" | "bottom-start" | "bottom";
  /** Whether to close the panel when an app is selected */
  closeOnSelect?: boolean;
}

export interface AppSwitcherWithApps extends AppSwitcherBaseProps {
  /** Static apps to display in the grid */
  apps: AppItem[];
  baseUrl?: never;
  accessToken?: never;
}

export interface AppSwitcherWithFetch extends AppSwitcherBaseProps {
  apps?: never;
  /** API base URL, e.g. `https://api.example.com` */
  baseUrl: string;
  /** Bearer access token for authenticated requests */
  accessToken: string;
}

export type AppSwitcherProps = AppSwitcherWithApps | AppSwitcherWithFetch;

export interface UseMeAppsOptions {
  baseUrl: string;
  accessToken: string;
  enabled?: boolean;
}

export interface UseMeAppsReturn {
  apps: AppItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
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
