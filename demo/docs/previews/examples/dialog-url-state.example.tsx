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

export function DialogUrlStateExample() {
  const { open, data, onOpenChange, openWith } = useDialogSearchParam<{
    userId: string;
  }>("edit-profile");

  return (
    <>
      <Button variant="secondary" onClick={() => openWith({ userId: "42" })}>
        Edit profile
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent showCloseButton>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              URL state: <code>?dialog=edit-profile</code>
              {data?.userId ? (
                <>
                  {" "}
                  and <code>dialog.userId={data.userId}</code>
                </>
              ) : null}
              . Close the dialog or use the browser back button to clear the
              params.
            </DialogDescription>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
