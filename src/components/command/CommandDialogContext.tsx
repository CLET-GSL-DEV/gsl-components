import { createContext, useContext, type ReactNode } from "react";

export interface CommandDialogContextValue {
  inputShortcut?: string;
}

const CommandDialogContext = createContext<CommandDialogContextValue | null>(
  null,
);

export function CommandDialogProvider({
  children,
  inputShortcut,
}: {
  children: ReactNode;
  inputShortcut?: string;
}) {
  return (
    <CommandDialogContext.Provider value={{ inputShortcut }}>
      {children}
    </CommandDialogContext.Provider>
  );
}

export function useCommandDialog() {
  return useContext(CommandDialogContext);
}
