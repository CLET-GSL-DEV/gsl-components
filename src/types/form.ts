import type { ReactNode } from "react";
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProviderProps,
} from "react-hook-form";

export type FormProps<TFieldValues extends FieldValues> = FormProviderProps<TFieldValues>;

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName>;

export interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

export interface UseFormFieldReturn {
  id: string;
  name: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  invalid: boolean;
  error?: { message?: string };
}

export interface FormFieldRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  fieldContext: FormFieldContextValue<TFieldValues, TName>;
  children?: ReactNode;
}
