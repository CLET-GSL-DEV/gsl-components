import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  Info,
} from "lucide-react";
import { Button, ToastProvider, Toaster, useToast } from "@rfdtech/components";

function ToastTriggers() {
  const { toast } = useToast();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Profile saved",
            description: "Your changes were applied.",
            variant: "success",
            icon: <CheckCircle2 size={18} strokeWidth={2} aria-hidden />,
          })
        }
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Sync in progress",
            description: "This may take a few seconds.",
            variant: "warning",
            icon: <AlertTriangle size={18} strokeWidth={2} aria-hidden />,
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Upload failed",
            description: "The file could not be uploaded.",
            variant: "error",
            icon: <CircleX size={18} strokeWidth={2} aria-hidden />,
            action: {
              label: "Retry",
              onClick: () => {
                toast({
                  title: "Retrying upload",
                  variant: "default",
                  icon: <Info size={18} strokeWidth={2} aria-hidden />,
                });
              },
            },
          })
        }
      >
        Error with action
      </Button>
    </div>
  );
}

export function ToastExample() {
  return (
    <ToastProvider>
      <ToastTriggers />
      <Toaster />
    </ToastProvider>
  );
}
