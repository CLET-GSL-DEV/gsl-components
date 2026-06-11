import type { CSSProperties, ReactNode, RefObject } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  ariaLabel: string;
  value: string | null;
  onChange: (value: string | null) => void;
  loadOptions: (query: string) => Promise<DropdownOption[]>;
  placeholder?: string;
  debounceMs?: number;
  minSearchLength?: number;
  getOptionLabel?: (value: string) => string | undefined;
  noResultsText?: string;
  loadingText?: string;
  clearable?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export interface DropdownProps {
  ariaLabel: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: DropdownOption[];
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export interface DropdownMenuItem {
  id: string;
  label: ReactNode;
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
}

export type DropdownMenuPlacement = "bottom-start" | "bottom-end" | "bottom";

export interface DropdownMenuProps {
  trigger: ReactNode | ((state: { open: boolean }) => ReactNode);
  items: DropdownMenuItem[];
  ariaLabel: string;
  placement?: DropdownMenuPlacement;
  closeOnSelect?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export interface UseDropdownOptions {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UseDropdownReturn<
  T extends HTMLElement = HTMLElement,
  U extends HTMLElement = HTMLElement,
> {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  triggerRef: RefObject<U | null>;
  panelRef: RefObject<T | null>;
}

export interface UseComboboxSearchOptions {
  loadOptions: (query: string) => Promise<DropdownOption[]>;
  debounceMs?: number;
  minSearchLength?: number;
  enabled?: boolean;
}

export interface UseComboboxSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  options: DropdownOption[];
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}
