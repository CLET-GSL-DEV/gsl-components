import { createContext, useContext, type ReactNode, type RefObject } from "react";

export interface CommandPopoverContextValue {
  isInline: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  inputWrapperRef: RefObject<HTMLDivElement | null>;
  blurTimeoutRef: RefObject<ReturnType<typeof setTimeout> | undefined>;
  cancelPendingClose: () => void;
  /** Accessible name of the results popover. */
  label: string;
}

const CommandPopoverContext = /* @__PURE__ */ createContext<CommandPopoverContextValue | null>(null);

export function CommandPopoverProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: CommandPopoverContextValue;
}) {
  return (
    <CommandPopoverContext.Provider value={value}>
      {children}
    </CommandPopoverContext.Provider>
  );
}

export function useCommandPopover() {
  return useContext(CommandPopoverContext);
}
