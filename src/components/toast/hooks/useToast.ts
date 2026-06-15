import { useCallback, useContext } from "react";
import { toast as sonnerToast } from "sonner";
import type { ToastOptions, ToastReturn, ToastVariant, UseToastReturn } from "../../../types/toast";
import { ToastDefaultsContext } from "../ToastProvider";

function getToastFn(variant: ToastVariant = "default") {
  switch (variant) {
    case "success":
      return sonnerToast.success;
    case "warning":
      return sonnerToast.warning;
    case "error":
      return sonnerToast.error;
    default:
      return sonnerToast;
  }
}

export function useToast(): UseToastReturn {
  const defaults = useContext(ToastDefaultsContext);

  if (!defaults) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const show = useCallback(
    (options: ToastOptions): ToastReturn => {
      const message = options.title ?? options.description ?? "";
      const description = options.title ? options.description : undefined;
      const showToast = getToastFn(options.variant);

      const id = showToast(message, {
        id: options.id,
        description,
        icon: options.icon,
        duration: options.duration ?? defaults.duration,
        action: options.action
          ? {
              label: options.action.label,
              onClick: options.action.onClick,
            }
          : undefined,
      });

      return {
        id: String(id),
        dismiss: () => {
          sonnerToast.dismiss(id);
        },
      };
    },
    [defaults.duration],
  );

  return {
    toast: show,
    dismiss: (id?: string) => {
      sonnerToast.dismiss(id);
    },
    toasts: [],
  };
}
