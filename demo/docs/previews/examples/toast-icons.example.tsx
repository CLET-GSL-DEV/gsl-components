import {
  Bell,
  CheckCircle2,
  Info,
  Paperclip,
} from "lucide-react";
import { Button, ToastProvider, Toaster, useToast } from "@rfdtech/components";

function ToastIconTriggers() {
  const { toast } = useToast();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "New message",
            description: "Alex sent you a file.",
            icon: <Bell size={18} strokeWidth={2} aria-hidden />,
          })
        }
      >
        Default + icon
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Backup complete",
            variant: "success",
            icon: <CheckCircle2 size={18} strokeWidth={2} aria-hidden />,
          })
        }
      >
        Title only
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Attachment added",
            description: "report-q2.pdf",
            variant: "default",
            icon: <Paperclip size={18} strokeWidth={2} aria-hidden />,
          })
        }
      >
        Custom SVG
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Tip",
            description: "Any React node works — emoji, SVG, or component.",
            icon: <span aria-hidden>💡</span>,
          })
        }
      >
        Emoji icon
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: "Session expiring",
            description: "Save your work to keep changes.",
            variant: "warning",
            icon: <Info size={18} strokeWidth={2} aria-hidden />,
            action: {
              label: "Extend",
              onClick: () => {},
            },
          })
        }
      >
        Icon + action
      </Button>
    </div>
  );
}

export function ToastIconsExample() {
  return (
    <ToastProvider>
      <ToastIconTriggers />
      <Toaster />
    </ToastProvider>
  );
}
