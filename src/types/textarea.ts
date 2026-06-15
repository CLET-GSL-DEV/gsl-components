import type { TextareaHTMLAttributes } from "react";

export interface TextareaClassNames {
  root?: string;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  classNames?: TextareaClassNames;
  className?: string;
}
