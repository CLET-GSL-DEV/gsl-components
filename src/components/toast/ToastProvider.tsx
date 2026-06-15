import { createContext, useMemo, type ReactNode } from "react";
import type { ToastDefaults, ToastProviderProps } from "../../types/toast";

export const ToastDefaultsContext = createContext<ToastDefaults | null>(null);

export function ToastProvider({
  duration = 5000,
  limit = 3,
  children,
}: ToastProviderProps) {
  const value = useMemo(
    () => ({
      duration,
      limit,
    }),
    [duration, limit],
  );

  return (
    <ToastDefaultsContext.Provider value={value}>
      {children}
    </ToastDefaultsContext.Provider>
  );
}
