import { useState } from "react";
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
  ModalTrigger,
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
  const [open, setOpen] = useState(false);

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button variant="secondary">Review changes</Button>
      </ModalTrigger>
      <ModalPortal>
        <ModalOverlay />
        <ModalContent showCloseButton>
          <ModalHeader>
            <ModalTitle>Review changes</ModalTitle>
            <ModalDescription>
              Confirm the items below before publishing to the public site.
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
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Publish</Button>
          </ModalFooter>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
