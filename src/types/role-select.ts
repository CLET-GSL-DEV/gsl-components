import type { CSSProperties, ReactNode } from "react";

export interface Role {
  /** Unique identifier for the role */
  id: string;
  /** Display name shown in the list */
  name: string;
  /** Optional icon rendered before the name, in the list item and (when selected) the trigger */
  icon?: ReactNode;
  /** Whether the role is disabled */
  disabled?: boolean;
}

export interface RoleSelectProps {
  /** Label shown on the dropdown trigger (default: "View as") */
  title?: string;
  /** Roles to display in the list */
  roles: Role[];
  /** Currently selected role id, shown with a filled radio dot */
  selectedRole?: string;
  /** Called when a role is selected (after confirmation, unless noConfirm is set) */
  onClickRole: (role: Role) => void;
  /** Skip the "Confirm Role Switch" dialog and call onClickRole immediately */
  noConfirm?: boolean;
  /** Additional CSS class for the root container */
  className?: string;
  /** Inline styles for the root container */
  style?: CSSProperties;
}
