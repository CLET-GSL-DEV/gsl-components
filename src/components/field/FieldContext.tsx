import { createContext, useContext } from "react";
import type { FieldContextValue } from "../../types/field";

export const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext() {
  const context = useContext(FieldContext);

  if (!context) {
    throw new Error("Field components must be used within a Field");
  }

  return context;
}
