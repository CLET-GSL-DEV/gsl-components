import { useId } from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { FormFieldProps, FormProps, UseFormFieldReturn } from "../../types/form";
import { FormFieldContext, useFormFieldContext } from "./FormFieldContext";

export const Form = FormProvider;

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      {...props}
      render={(renderProps) => (
        <FormFieldContext.Provider value={{ name: props.name }}>
          {props.render(renderProps)}
        </FormFieldContext.Provider>
      )}
    />
  );
}

export function useFormField(): UseFormFieldReturn {
  const fieldContext = useFormFieldContext();
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  const generatedId = useId();
  const id = generatedId.replace(/:/g, "");

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    invalid: !!fieldState.error,
    error: fieldState.error,
  };
}
