import type { ReactElement, ReactNode } from "react";
import type { RoleSelect } from "../components/role-select/RoleSelect";
import type { RoleSelectProps } from "./role-select";

export interface ProfilePopoverItem {
  /** Leading icon, e.g. a lucide-react icon element */
  icon?: ReactNode;
  /** Row label */
  label: ReactNode;
  /** Called when the row is clicked */
  onClick?: () => void;
  /** Renders the row in the destructive/danger color */
  danger?: boolean;
}

/** User shape for the `user`/`variant` header-style trigger — see `ProfilePopoverProps.user`. */
export interface AppUser {
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  initials: string;
}

export interface ProfilePopoverProps {
  /**
   * User's full name, shown next to the avatar and in the popover header.
   * Omit when passing `user` instead — it's derived from `user.name`.
   */
  fullName?: string;
  /**
   * User's email, shown under the full name in the popover header. Omit
   * when passing `user` instead — it's derived from `user.email`.
   */
  email?: string;
  /**
   * Profile photo URL; falls back to initials when omitted or failing to
   * load. Omit when passing `user` instead — it's derived from `user.avatar`.
   */
  profilePhoto?: string;
  /**
   * User object (name, role, initials, optional email/avatar) — an
   * alternative to `fullName`/`email`/`profilePhoto` that also builds the
   * compact avatar + name/role + chevron trigger used in `AppHeader`
   * (governed by `variant`), instead of the default avatar + name/email
   * button row.
   */
  user?: AppUser;
  /**
   * Trigger layout when `user` is passed. `"full"` shows avatar + name/role
   * + chevron. `"avatar"` shows only the avatar (no name/role/chevron) —
   * useful for compact headers. Both open the same popover.
   */
  variant?: "full" | "avatar";
  /** Custom trigger element — overrides the built-in trigger entirely (`user` or `fullName` based). */
  trigger?: ReactNode;
  /** Merged onto the built-in trigger element (ignored when `trigger` is passed). */
  triggerClassName?: string;
  /** Menu rows rendered below the header (e.g. "My Profile", "Account Settings") */
  items?: ProfilePopoverItem[];
  /** Called when "Sign Out" is clicked */
  onSignOut?: () => void;
  /**
   * Show shimmering skeleton placeholders instead of the header
   * (avatar/name/email) and menu rows. The default trigger (when no
   * custom `trigger` is passed) shimmers too. "Sign Out" stays interactive.
   */
  loading?: boolean;
  /** Accessible label announced while loading (default: "Loading profile") */
  loadingLabel?: string;
  /**
   * Extra composable content rendered directly below `items` — only a
   * `RoleSelect` element is accepted. No divider renders between `items`
   * and `children`; they sit in the same content block. A divider only
   * separates the header from this block, and this block from "Sign Out".
   */
  children?: ReactElement<RoleSelectProps, typeof RoleSelect>;
  /** Popover placement side (default: "top") */
  side?: "top" | "right" | "bottom" | "left";
  /** Popover placement alignment (default: "start") */
  align?: "start" | "center" | "end";
  /** Popover offset from the trigger (default: 8) */
  sideOffset?: number;
  /** Merged onto the popover content element */
  className?: string;
}
