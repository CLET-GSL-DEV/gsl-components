import type {
  HTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
  ReactNode,
} from "react";

export type StepState = "complete" | "active" | "upcoming";

export interface StepperClassNames {
  root?: string;
}

export interface StepperProps extends Omit<
  OlHTMLAttributes<HTMLOListElement>,
  "className"
> {
  value: number;
  clickable?: boolean;
  onValueChange?: (value: number) => void;
  classNames?: StepperClassNames;
  className?: string;
  children: ReactNode;
}

export interface StepClassNames {
  root?: string;
  button?: string;
  marker?: string;
  number?: string;
  check?: string;
  connector?: string;
}

export interface StepInternalProps {
  __isLast?: boolean;
}

export interface StepProps
  extends Omit<LiHTMLAttributes<HTMLLIElement>, "className">,
    StepInternalProps {
  value: number;
  disabled?: boolean;
  classNames?: StepClassNames;
  className?: string;
  children?: ReactNode;
}

export interface StepLabelClassNames {
  root?: string;
}

export interface StepLabelProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "className"> {
  classNames?: StepLabelClassNames;
  className?: string;
  children?: ReactNode;
}

export interface StepperContextValue {
  value: number;
  clickable: boolean;
  onValueChange?: (value: number) => void;
}
