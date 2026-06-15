import type { InputHTMLAttributes } from "react";

export interface InputClassNames {
  root?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  classNames?: InputClassNames;
  className?: string;
}
