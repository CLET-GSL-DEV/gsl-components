import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  useModalSearchParam,
} from "@rfdtech/components";

const reviewItems = [
  "Update homepage hero copy",
  "Publish Q2 enrollment announcement",
  "Archive outdated policy PDFs",
  "Notify department heads by email",
  "Schedule social posts for Monday",
  "Review accessibility checklist",
  "Confirm footer contact details",
  "Export analytics snapshot",
];

export function ModalExample() {
  const { open, onOpenChange, openWith } = useModalSearchParam("review-changes");

  return (
    <>
      <Button variant="secondary" onClick={() => openWith()}>
        Review changes
      </Button>
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent showCloseButton>
            <ModalHeader>
              <ModalTitle>Review changes</ModalTitle>
              <ModalDescription>
                Confirm the items below before publishing to the public site.
                URL state: <code>?modal=review-changes</code>.
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  display: "grid",
                  gap: 10,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {reviewItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => onOpenChange(false)}>Publish</Button>
            </ModalFooter>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </>
  );
}
