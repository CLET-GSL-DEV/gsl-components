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

export interface ProfilePopoverProps {
  /** User's full name, shown next to the avatar and in the popover header */
  fullName: string;
  /** User's email, shown under the full name in the popover header */
  email?: string;
  /** Profile photo URL; falls back to initials when omitted or failing to load */
  profilePhoto?: string;
  /** Custom trigger element. Defaults to an avatar + name/email row. */
  trigger?: ReactNode;
  /** Rendered at the far right of the popover header row (e.g. a theme toggle icon button) */
  headerAction?: ReactNode;
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
   * Extra composable content rendered between `items` and "Sign Out" —
   * only a `RoleSelect` element is accepted. Rendered flat, with no
   * extra container padding or divider unless there's something to
   * separate it from.
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
