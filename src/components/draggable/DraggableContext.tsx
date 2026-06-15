import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UseDraggableReturn } from "../../types/draggable";

interface DraggableContextValue extends UseDraggableReturn {
  disabled: boolean;
  hasHandle: boolean;
  registerHandle: () => () => void;
}

const DraggableContext = createContext<DraggableContextValue | null>(null);

export function DraggableProvider({
  disabled,
  draggable,
  children,
}: {
  disabled: boolean;
  draggable: UseDraggableReturn;
  children: ReactNode;
}) {
  const [handleCount, setHandleCount] = useState(0);

  const registerHandle = useMemo(
    () => () => {
      setHandleCount((count) => count + 1);

      return () => {
        setHandleCount((count) => Math.max(0, count - 1));
      };
    },
    [],
  );

  const value = useMemo(
    () => ({
      ...draggable,
      disabled,
      hasHandle: handleCount > 0,
      registerHandle,
    }),
    [disabled, draggable, handleCount, registerHandle],
  );

  return (
    <DraggableContext.Provider value={value}>{children}</DraggableContext.Provider>
  );
}

export function useDraggableContext() {
  const context = useContext(DraggableContext);

  if (!context) {
    throw new Error("Draggable parts must be used within Draggable");
  }

  return context;
}

export function useDraggableHandleRegistration() {
  const { registerHandle } = useDraggableContext();

  useEffect(() => registerHandle(), [registerHandle]);
}
