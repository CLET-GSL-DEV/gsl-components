import { useContext } from "react";
import { Toaster as SonnerToaster } from "sonner";
import type { ToasterProps } from "../../types/toast";
import { cn } from "../../utils/cn";
import { ThemeContext } from "../theme/ThemeContext";
import { ToastDefaultsContext } from "./ToastProvider";
import "../button/styles/button.css";
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
      className={cn("clet-toast__viewport gsl-toast__viewport", classNames?.viewport, className)}
      toastOptions={{
        unstyled: true,
        closeButton: true,
        classNames: {
          toast: "clet-toast gsl-toast",
          title: "clet-toast__title gsl-toast__title",
          description: "clet-toast__description gsl-toast__description",
          actionButton: "clet-button gsl-button clet-button--secondary gsl-button--secondary clet-button--sm gsl-button--sm",
          closeButton: "clet-button gsl-button clet-button--sm gsl-button--sm clet-toast__close gsl-toast__close",
          icon: "clet-toast__icon gsl-toast__icon",
          default: "clet-toast--default gsl-toast--default",
          success: "clet-toast--success gsl-toast--success",
          warning: "clet-toast--warning gsl-toast--warning",
          error: "clet-toast--error gsl-toast--error",
        },
      }}
    />
  );
}
