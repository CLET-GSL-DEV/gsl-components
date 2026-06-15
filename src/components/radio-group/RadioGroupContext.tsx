import { createContext, useContext, type ReactNode } from "react";
import type { RadioGroupVariant } from "../../types/radio-group";

interface RadioGroupContextValue {
  variant: RadioGroupVariant;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({
  variant: "default",
});

export function RadioGroupProvider({
  variant,
  children,
}: {
  variant: RadioGroupVariant;
  children: ReactNode;
}) {
  return (
    <RadioGroupContext.Provider value={{ variant }}>
      {children}
    </RadioGroupContext.Provider>
  );
}

export function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}
