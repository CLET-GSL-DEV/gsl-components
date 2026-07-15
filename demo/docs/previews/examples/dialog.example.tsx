import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  useDialogSearchParam,
} from "@rfdtech/components";

export function DialogExample() {
  const { open, data, onOpenChange, openWith } = useDialogSearchParam<{
    userId: string;
  }>("edit-profile");

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => openWith({ userId: "42" })}
      >
        Edit profile
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent showCloseButton>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update your name and contact details. Changes are saved when you
              submit the form.
              {data?.userId ? (
                <>
                  {" "}
                  Editing user <strong>{data.userId}</strong> (
                  <code>?dialog=edit-profile&dialog.userId={data.userId}</code>
                  ).
                </>
              ) : null}
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
                    border: "1px solid var(--clet-border)",
                    borderRadius: "var(--clet-radius-base)",
                    background: "var(--clet-bg)",
                    color: "var(--clet-text)",
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
                    border: "1px solid var(--clet-border)",
                    borderRadius: "var(--clet-radius-base)",
                    background: "var(--clet-bg)",
                    color: "var(--clet-text)",
                  }}
                />
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => onOpenChange(false)}>Save changes</Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
