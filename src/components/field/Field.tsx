import { useId, useLayoutEffect, useMemo, useState } from "react";
import type {
  FieldControlProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldLabelProps,
  FieldProps,
} from "../../types/field";
import { cn } from "../../utils/cn";
import { Slot } from "../../utils/slot";
import { FieldContext, useFieldContext } from "./FieldContext";
import "./styles/field.css";

export function Field({
  invalid = false,
  classNames,
  className,
  children,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const id = generatedId.replace(/:/g, "");
  const [hasDescription, setHasDescription] = useState(false);
  const [hasError, setHasError] = useState(false);

  const contextValue = useMemo(
    () => ({
      id,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
      hasDescription,
      hasError,
      setHasDescription,
      setHasError,
    }),
    [hasDescription, hasError, id, invalid],
  );

  return (
    <FieldContext.Provider value={contextValue}>
      <div
        className={cn("clet-field", invalid && "clet-field--invalid", classNames?.root, className)}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

export function FieldLabel({
  classNames,
  className,
  children,
  ...props
}: FieldLabelProps) {
  const { id } = useFieldContext();

  return (
    <label
      htmlFor={id}
      className={cn("clet-field__label", classNames?.label, className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function FieldDescription({
  classNames,
  className,
  children,
  ...props
}: FieldDescriptionProps) {
  const { descriptionId, setHasDescription } = useFieldContext();

  useLayoutEffect(() => {
    if (!children) {
      return;
    }

    setHasDescription(true);
    return () => {
      setHasDescription(false);
    };
  }, [children, setHasDescription]);

  if (!children) {
    return null;
  }

  return (
    <p
      id={descriptionId}
      className={cn("clet-field__description", classNames?.description, className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function FieldError({
  classNames,
  className,
  children,
  ...props
}: FieldErrorProps) {
  const { errorId, setHasError } = useFieldContext();

  useLayoutEffect(() => {
    if (!children) {
      return;
    }

    setHasError(true);
    return () => {
      setHasError(false);
    };
  }, [children, setHasError]);

  if (!children) {
    return null;
  }

  return (
    <p
      id={errorId}
      role="alert"
      className={cn("clet-field__error", classNames?.error, className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function FieldControl({ classNames, className, children }: FieldControlProps) {
  const { id, descriptionId, errorId, invalid, hasDescription, hasError } =
    useFieldContext();

  const describedBy = [
    hasDescription ? descriptionId : null,
    hasError ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Slot
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy || undefined}
      className={cn(classNames?.control, className)}
    >
      {children as React.ReactElement}
    </Slot>
  );
}
