import { useState } from "react";
import {
  Button,
  Combobox,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
} from "@rfdtech/components";

const DOCUMENTS = [
  { value: "board-pack-q3", label: "Q3 Board Pack.pdf" },
  { value: "audited-accounts-2025", label: "Audited Accounts 2025.xlsx" },
  { value: "minutes-jul", label: "Minutes of the July sitting.docx" },
  { value: "accreditation-report", label: "Accreditation visit report.pdf" },
  { value: "fee-schedule", label: "Fee schedule 2026.csv" },
  { value: "staff-list", label: "Staff list.xlsx" },
  { value: "tender-notice", label: "Tender notice.pdf" },
  { value: "policy-manual", label: "Policy manual.docx" },
];

export function ComboboxInModalExample() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const selected = DOCUMENTS.find((d) => d.value === value) ?? null;

  return (
    <div>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Attach a document
      </Button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Attach a document</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Combobox
                options={DOCUMENTS}
                value={value}
                onValueChange={setValue}
                placeholder="Search documents"
                aria-label="Search documents"
              />
              {selected ? (
                <p style={{ margin: "12px 0 0" }}>
                  Ready to attach: <strong>{selected.label}</strong>
                </p>
              ) : (
                <p
                  style={{
                    margin: "12px 0 0",
                    color: "var(--clet-text-secondary)",
                  }}
                >
                  Pick a document from the list above.
                </p>
              )}
            </ModalBody>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </div>
  );
}
