import type { ReactNode } from "react";

export type ToastVariant = "default" | "success" | "warning" | "error";

export interface ToastClassNames {
  viewport?: string;
  toast?: string;
  title?: string;
  description?: string;
  actionButton?: string;
  closeButton?: string;
  icon?: string;
  default?: string;
  success?: string;
  warning?: string;
  error?: string;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

export interface ToastProviderProps {
  duration?: number;
  limit?: number;
  children: ReactNode;
}

export interface ToasterProps {
  classNames?: Pick<ToastClassNames, "viewport">;
  className?: string;
}

export interface ToastReturn {
  id: string;
  dismiss: () => void;
}

export interface UseToastReturn {
  toast: (options: ToastOptions) => ToastReturn;
  dismiss: (id?: string) => void;
  /** @deprecated Sonner does not expose the toast queue; always returns `[]`. */
  toasts: never[];
}

export interface ToastDefaults {
  duration: number;
  limit: number;
}
