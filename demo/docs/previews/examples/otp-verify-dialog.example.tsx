import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  OtpInput,
} from "@rfdtech/components";

// Mock "correct" code — stands in for a real server-side verification call.
const MOCK_VALID_CODE = "123456";

type VerifyStatus = "idle" | "verifying" | "error" | "success";

export function OtpVerifyDialogExample() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");

  const reset = () => {
    setCode("");
    setStatus("idle");
  };

  const verify = (value: string) => {
    if (value.length < 6 || status === "verifying") return;
    setStatus("verifying");
    // Simulate an async verification request.
    setTimeout(() => {
      if (value === MOCK_VALID_CODE) {
        setStatus("success");
        setTimeout(() => {
          setOpen(false);
          reset();
        }, 900);
      } else {
        setStatus("error");
      }
    }, 1200);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        Verify identity
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent showCloseButton>
            <DialogTitle>Two-factor verification</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to your registered device to confirm
              this action. (Hint: the mock code is <code>123456</code>.)
            </DialogDescription>

            <div style={{ display: "grid", gap: 8 }}>
              <OtpInput
                length={6}
                value={code}
                disabled={status === "verifying" || status === "success"}
                invalid={status === "error"}
                onChange={(value) => {
                  setCode(value);
                  if (status === "error") setStatus("idle");
                }}
                onComplete={(value) => verify(value)}
              />
              {status === "error" && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--gsl-error-text)" }}>
                  Incorrect code. Please try again.
                </p>
              )}
              {status === "success" && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--gsl-success)" }}>
                  Verified successfully.
                </p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={status === "verifying"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => verify(code)}
                disabled={code.length < 6 || status === "verifying" || status === "success"}
                loading={status === "verifying"}
                loadingLabel="Verifying..."
              >
                Verify
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
