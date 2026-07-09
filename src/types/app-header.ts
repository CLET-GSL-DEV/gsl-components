import type { HTMLAttributes, ReactNode } from "react";

// ── AppHeader ──

export interface AppHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
  /**
   * Visual style. "default" = subtle rounded panel surface.
   * "plain" = square edges (no border radius), primary background, on-primary text.
   */
  variant?: "default" | "plain";
}

export interface AppHeaderActionsProps {
  className?: string;
  children?: ReactNode;
}

// ── AppHeaderBranding ──

export interface AppHeaderBrandingProps {
  className?: string;
  /** Inline logo node (e.g. an <img> or icon). */
  logo?: ReactNode;
  /** Main title text, rendered bold. */
  title?: ReactNode;
  /** Secondary text, rendered larger but not bold. */
  subtitle?: ReactNode;
  /** Custom content, overrides title/subtitle rendering. */
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
  /**
   * Render variant.
   * "full" shows large avatar + email + carded actions.
   * "basic" shows compact inline avatar + name/role + flat actions.
   * "avatar" shows only the avatar in the header (no name/role/chevron) and opens the full profile popover on click.
   */
  variant?: "full" | "basic" | "avatar";
}
