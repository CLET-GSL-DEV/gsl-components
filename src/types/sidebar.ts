import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

export interface SidebarProviderClassNames {
  root?: string;
}

export interface SidebarClassNames {
  root?: string;
}

export interface SidebarOverlayClassNames {
  overlay?: string;
}

export interface SidebarTriggerClassNames {
  trigger?: string;
}

export interface SidebarCollapseClassNames {
  collapse?: string;
}

export interface SidebarHeaderClassNames {
  header?: string;
}

export interface SidebarContentClassNames {
  content?: string;
}

export interface SidebarFooterClassNames {
  footer?: string;
}

export interface SidebarNavClassNames {
  nav?: string;
}

export interface SidebarGroupClassNames {
  group?: string;
}

export interface SidebarGroupLabelClassNames {
  groupLabel?: string;
}

export interface SidebarItemClassNames {
  item?: string;
}

export interface SidebarBadgeClassNames {
  badge?: string;
}

export interface SidebarLinkClassNames {
  link?: string;
}

export interface SidebarProviderProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  breakpoint?: number;
  classNames?: SidebarProviderClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarProps {
  classNames?: SidebarClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarOverlayProps {
  classNames?: SidebarOverlayClassNames;
  className?: string;
}

export interface SidebarTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  classNames?: SidebarTriggerClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarCollapseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  classNames?: SidebarCollapseClassNames;
  className?: string;
}

export interface SidebarHeaderProps {
  classNames?: SidebarHeaderClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarBrandProps {
  classNames?: { root?: string };
  className?: string;
  children: ReactNode;
}

export interface SidebarContentProps {
  classNames?: SidebarContentClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarFooterProps {
  classNames?: SidebarFooterClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  classNames?: SidebarNavClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarGroupProps {
  classNames?: SidebarGroupClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarGroupLabelProps {
  classNames?: SidebarGroupLabelClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarItemProps {
  classNames?: SidebarItemClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarBadgeProps {
  classNames?: SidebarBadgeClassNames;
  className?: string;
  children: ReactNode;
}

export interface SidebarLinkProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  asChild?: boolean;
  icon?: ReactNode;
  /** If provided, renders as a react-router `<Link>` with this path */
  to?: string;
  classNames?: SidebarLinkClassNames;
  className?: string;
  children: ReactNode;
}
