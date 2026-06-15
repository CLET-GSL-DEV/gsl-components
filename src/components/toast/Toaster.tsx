import { useContext } from "react";
import { Toaster as SonnerToaster } from "sonner";
import type { ToasterProps } from "../../types/toast";
import { cn } from "../../utils/cn";
import { ThemeContext } from "../theme/ThemeContext";
import { ToastDefaultsContext } from "./ToastProvider";
import "./styles/toast.css";

export function Toaster({ classNames, className }: ToasterProps) {
  const defaults = useContext(ToastDefaultsContext);
  const themeContext = useContext(ThemeContext);

  if (!defaults) {
    throw new Error("Toaster must be used within a ToastProvider");
  }

  return (
    <SonnerToaster
      position="bottom-right"
      theme={themeContext?.resolvedTheme ?? "system"}
      visibleToasts={defaults.limit}
      duration={defaults.duration}
      className={cn("gsl-toast__viewport", classNames?.viewport, className)}
      toastOptions={{
        unstyled: true,
        closeButton: true,
        classNames: {
          toast: "gsl-toast",
          title: "gsl-toast__title",
          description: "gsl-toast__description",
          actionButton: "gsl-toast__action",
          closeButton: "gsl-toast__close",
          icon: "gsl-toast__icon",
          default: "gsl-toast--default",
          success: "gsl-toast--success",
          warning: "gsl-toast--warning",
          error: "gsl-toast--error",
        },
      }}
    />
  );
}
