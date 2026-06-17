import type { ReactNode } from "react";

// ── AppHeader ──

export interface AppHeaderProps {
  className?: string;
  /** Search trigger (AppHeaderSearch) */
  search?: ReactNode;
  /** App switcher trigger */
  appSwitcher?: ReactNode;
  /** Notifications button (AppHeaderNotifications) */
  notifications?: ReactNode;
  /** User profile (AppHeaderProfile) */
  profile?: ReactNode;
}

// ── AppHeaderSearch ──

export interface AppHeaderSearchItem {
  value: string;
  /** Rendered content — string or custom JSX. */
  label: ReactNode;
  onSelect?: () => void;
}

export interface AppHeaderSearchDataGroup {
  heading?: string;
  items: AppHeaderSearchItem[];
  loading?: boolean;
  loadingLabel?: string;
}

export interface AppHeaderSearchProps {
  className?: string;
  placeholder?: string;
  /** Data groups rendered as CommandGroup elements. Drive from tanstack query. */
  data?: AppHeaderSearchDataGroup[];
  /** Debounced search callback (300ms). */
  onSearch?: (value: string) => void;
  /** Show "no results" empty state. */
  showEmpty?: boolean;
  emptyLabel?: string;
  /** Accessible label for the search input. */
  label?: string;
  children?: ReactNode;
}

// ── AppHeaderNotifications ──

export interface AppHeaderNotificationsProps {
  className?: string;
  children?: ReactNode;
  /** Show loading skeleton state */
  loading?: boolean;
}

// ── AppHeaderProfile ──

export interface AppUser {
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  initials: string;
}

export interface AppHeaderProfileProps {
  user: AppUser;
  children?: ReactNode;
  className?: string;
}
