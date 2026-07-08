import { createContext, useContext } from "react";
import type { StepperContextValue } from "../../types/stepper";

export const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext(): StepperContextValue {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error("Step must be used within a Stepper");
  }

  return context;
}
