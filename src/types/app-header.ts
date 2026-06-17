import type { HTMLAttributes, ReactNode } from "react";

// ── AppHeader ──

export interface AppHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export interface AppHeaderActionsProps {
  className?: string;
  children?: ReactNode;
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
  /** Accessible label for the loading state */
  loadingLabel?: string;
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
  /** Render variant. "full" shows large avatar + email + carded actions. "basic" shows compact inline avatar + name/role + flat actions. */
  variant?: "full" | "basic";
}
