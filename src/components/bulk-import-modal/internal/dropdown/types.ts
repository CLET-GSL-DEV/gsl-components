import type { CSSProperties, RefObject } from "react";

export interface FieldMappingDropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FieldMappingDropdownProps {
  ariaLabel: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: FieldMappingDropdownOption[];
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export interface UseFieldMappingDropdownOptions {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UseFieldMappingDropdownReturn<
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

export interface FieldMappingDropdownPosition {
  top: number;
  left: number;
  width: number;
}
