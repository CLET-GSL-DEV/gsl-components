import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { RoleSelect } from "../components/role-select/RoleSelect";
import type { RoleSelectProps } from "./role-select";

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
  /** Extra composable content rendered below "Help & Support" — only a `RoleSelect` element is accepted */
  children?: ReactElement<RoleSelectProps, typeof RoleSelect>;
  className?: string;
  /**
   * Render variant for the header trigger row.
   * "full" shows avatar + name/role + chevron.
   * "avatar" shows only the avatar (no name/role/chevron).
   * Both open the same `ProfilePopover` menu on click.
   */
  variant?: "full" | "avatar";
  /** Rendered at the far right of the popover header row (e.g. a theme toggle icon button) */
  headerAction?: ReactNode;
  /** Show shimmering skeleton placeholders instead of the avatar/name/role, in both the trigger and the opened popover */
  loading?: boolean;
  /** Accessible label announced while loading (default: "Loading profile") */
  loadingLabel?: string;
  /** Called when "My Profile" is clicked */
  onProfileClick?: () => void;
  /** Called when "Account Settings" is clicked */
  onSettingsClick?: () => void;
  /** Called when "Help & Support" is clicked */
  onHelpClick?: () => void;
  /** Called when "Sign Out" is clicked */
  onSignOut?: () => void;
}
