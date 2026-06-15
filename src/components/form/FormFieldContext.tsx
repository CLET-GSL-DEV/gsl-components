import { createContext, useContext } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FormFieldContextValue } from "../../types/form";

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormFieldContext<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>() {
  const context = useContext(FormFieldContext) as FormFieldContextValue<
    TFieldValues,
    TName
  > | null;

  if (!context) {
    throw new Error("useFormField must be used within a FormField");
  }

  return context;
}
