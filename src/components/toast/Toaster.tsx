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
      className={cn("clet-toast__viewport", classNames?.viewport, className)}
      toastOptions={{
        unstyled: true,
        closeButton: true,
        classNames: {
          toast: "clet-toast",
          title: "clet-toast__title",
          description: "clet-toast__description",
          actionButton: "clet-button clet-button--secondary clet-button--sm",
          closeButton: "clet-button clet-button--sm clet-toast__close",
          icon: "clet-toast__icon",
          default: "clet-toast--default",
          success: "clet-toast--success",
          warning: "clet-toast--warning",
          error: "clet-toast--error",
        },
      }}
    />
  );
}
