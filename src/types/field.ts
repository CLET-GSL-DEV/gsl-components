import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

export interface FieldClassNames {
  root?: string;
  label?: string;
  description?: string;
  error?: string;
  control?: string;
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  invalid?: boolean;
  classNames?: FieldClassNames;
  className?: string;
  children?: ReactNode;
}

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  classNames?: Pick<FieldClassNames, "label">;
  className?: string;
  children?: ReactNode;
}

export interface FieldDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  classNames?: Pick<FieldClassNames, "description">;
  className?: string;
  children?: ReactNode;
}

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  classNames?: Pick<FieldClassNames, "error">;
  className?: string;
  children?: ReactNode;
}

export interface FieldControlProps {
  classNames?: Pick<FieldClassNames, "control">;
  className?: string;
  children?: ReactNode;
}

export interface FieldContextValue {
  id: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
  hasDescription: boolean;
  hasError: boolean;
  setHasDescription: (value: boolean) => void;
  setHasError: (value: boolean) => void;
}
