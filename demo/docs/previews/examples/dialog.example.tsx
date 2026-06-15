import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@rfdtech/components";

export function DialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit profile</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent showCloseButton>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your name and contact details. Changes are saved when you
            submit the form.
          </DialogDescription>
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
              Full name
              <input
                type="text"
                defaultValue="Alex Johnson"
                style={{
                  height: 40,
                  padding: "0 12px",
                  border: "1px solid var(--gsl-border)",
                  borderRadius: "var(--gsl-radius)",
                  background: "var(--gsl-bg)",
                  color: "var(--gsl-text)",
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
              Email
              <input
                type="email"
                defaultValue="alex@example.com"
                style={{
                  height: 40,
                  padding: "0 12px",
                  border: "1px solid var(--gsl-border)",
                  borderRadius: "var(--gsl-radius)",
                  background: "var(--gsl-bg)",
                  color: "var(--gsl-text)",
                }}
              />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save changes</Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
