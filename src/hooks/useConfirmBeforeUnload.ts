import { useEffect } from "react";

/**
 * Shows a browser confirmation prompt when the user tries to close, refresh,
 * or navigate away from the page while `shouldConfirm` is true.
 *
 * @param shouldConfirm - Whether to show the prompt.
 * @param message - Custom message (most browsers ignore this and show their own).
 */
export function useConfirmBeforeUnload(
  shouldConfirm: boolean,
  message?: string,
): void {
  useEffect(() => {
    if (!shouldConfirm) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore the message but still show their default prompt
      e.returnValue = message ?? "";
      return message ?? ""; // Legacy support
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldConfirm, message]);
}
