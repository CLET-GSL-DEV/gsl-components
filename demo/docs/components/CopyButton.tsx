import { useCallback, useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "error";

interface CopyButtonProps {
  getText: () => string;
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Copy command failed");
  }
}

export function CopyButton({ getText }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimerRef = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const handleCopy = async () => {
    clearResetTimer();

    try {
      const text = getText();
      if (!text) {
        throw new Error("No code to copy");
      }

      await copyToClipboard(text);
      setState("copied");
      resetTimerRef.current = window.setTimeout(() => {
        setState("idle");
      }, 2000);
    } catch {
      setState("error");
      resetTimerRef.current = window.setTimeout(() => {
        setState("idle");
      }, 2000);
    }
  };

  const label =
    state === "copied" ? "Copied!" : state === "error" ? "Copy failed" : "Copy";

  return (
    <>
      <span className="demo-docs__copy-status" aria-live="polite">
        {state === "copied" ? "Copied to clipboard" : null}
        {state === "error" ? "Copy failed" : null}
      </span>
      <button
        type="button"
        className="demo-docs__copy-button"
        aria-label="Copy code to clipboard"
        onClick={() => void handleCopy()}
      >
        {label}
      </button>
    </>
  );
}
