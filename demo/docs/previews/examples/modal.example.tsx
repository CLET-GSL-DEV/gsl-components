import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
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
];

export function ModalExample() {
  const { open, onOpenChange, openWith } = useModalSearchParam("review-changes");
  const [dirty, setDirty] = useState(false);

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="secondary" onClick={() => { setDirty(false); openWith(); }}>
        Review changes
      </Button>
      <Button variant="secondary" onClick={() => { setDirty(true); openWith(); }}>
        With preventClose
      </Button>
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent
            showCloseButton
            size="lg"
            preventClose={dirty}
          >
            <ModalHeader>
              <ModalTitle>Review changes</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>
                Confirm the items below before publishing.
                {dirty && " Close prevention is active — try clicking the X or overlay."}
              </p>
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
    </div>
  );
}
