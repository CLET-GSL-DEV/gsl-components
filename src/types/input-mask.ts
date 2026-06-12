import type { CSSProperties, HTMLAttributes } from "react";

export interface InputMaskProps {
  mask: string;
  value?: string;
  defaultValue?: string;
  onChange?: (masked: string) => void;
  onValueChange?: (unmasked: string) => void;
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}
