import { useMemo, useState } from "react";
import {
  Button,
  Combobox,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  PageSection,
  SectionHeader,
  SectionTitle,
  SectionDescription,
} from "@rfdtech/components";

const DOC_TYPES = [
  "Board pack",
  "Audited accounts",
  "Committee minutes",
  "Accreditation report",
  "Fee schedule",
  "Staff list",
  "Tender notice",
  "Policy manual",
  "Insurance certificate",
  "Procurement plan",
  "Budget revision",
  "Audit response",
  "Risk register",
  "Performance review",
  "Travel claim",
  "Leave roster",
  "Inventory count",
  "Service contract",
  "Memorandum of understanding",
  "Quarterly narrative report",
];

const EXTENSIONS = [".pdf", ".xlsx", ".docx", ".csv", ".pptx"];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const YEARS = ["2023", "2024", "2025", "2026"];

function buildDocuments(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const type = DOC_TYPES[index % DOC_TYPES.length];
    const quarter = QUARTERS[Math.floor(index / DOC_TYPES.length) % QUARTERS.length];
    const year = YEARS[Math.floor(index / (DOC_TYPES.length * QUARTERS.length)) % YEARS.length];
    const extension = EXTENSIONS[index % EXTENSIONS.length];
    const serial = String(index + 1).padStart(2, "0");
    return {
      value: `doc-${serial}`,
      label: `${type} ${quarter} ${year}${extension} (${serial})`,
    };
  });
}

export function ComboboxModalStressPage() {
  const documents = useMemo(() => buildDocuments(50), []);
  const [singleOpen, setSingleOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);
  const [singleValue, setSingleValue] = useState<string | null>(null);
  const [multiValue, setMultiValue] = useState<string[]>([]);

  const singleSelected = documents.find((d) => d.value === singleValue) ?? null;
  const multiSelected = documents.filter((d) => multiValue.includes(d.value));

  return (
    <div>
      <SectionHeader>
        <SectionTitle>Combobox inside a modal</SectionTitle>
        <SectionDescription>
          A modal holding a 50-option Combobox so the option list overflows its
          320px cap and scrolls. Use it to check the full open, scroll, pick and
          dismiss behaviour, including how the list behaves above the modal
          body. The same Combobox sits at the bottom of this page outside any
          overlay, as a control.
        </SectionDescription>
      </SectionHeader>

      <PageSection>
        <SectionHeader>
          <SectionTitle>Inside a modal</SectionTitle>
          <SectionDescription>
            Both modals carry the same 50-option list. The single-select closes
            on pick; the multi-select stays open so you can scroll and toggle
            several options in one pass.
          </SectionDescription>
        </SectionHeader>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button variant="primary" onClick={() => setSingleOpen(true)}>
            Attach a document
          </Button>
          <Button onClick={() => setMultiOpen(true)}>Attach several documents</Button>
        </div>
        {singleSelected ? (
          <p style={{ margin: "12px 0 0" }}>
            Ready to attach: <strong>{singleSelected.label}</strong>
          </p>
        ) : (
          <p style={{ margin: "12px 0 0", color: "var(--clet-text-secondary)" }}>
            Pick a document from the single-select modal above.
          </p>
        )}
      </PageSection>

      <PageSection>
        <SectionHeader>
          <SectionTitle>Outside any overlay</SectionTitle>
          <SectionDescription>
            The identical 50-option Combobox with no modal behind it. If a click
            passes through the list here too, the defect follows the Combobox;
            if it only happens in the modal, it follows the overlay.
          </SectionDescription>
        </SectionHeader>
        <div style={{ maxWidth: "360px" }}>
          <Combobox
            aria-label="Control document picker"
            options={documents}
            value={singleValue}
            onValueChange={setSingleValue}
            placeholder="Search documents"
            clearable
          />
        </div>
      </PageSection>

      <Modal open={singleOpen} onOpenChange={setSingleOpen}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Attach a document</ModalTitle>
              <ModalDescription>
                Search fifty documents and pick one. The list scrolls when it
                overflows.
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <Combobox
                aria-label="Single document picker"
                options={documents}
                value={singleValue}
                onValueChange={setSingleValue}
                placeholder="Search documents"
                clearable
              />
              <p style={{ margin: "12px 0 0" }}>
                {singleSelected
                  ? (
                    <span>
                      Ready to attach: <strong>{singleSelected.label}</strong>
                    </span>
                  )
                  : "Pick a document from the list above."}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setSingleOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setSingleOpen(false)}>
                Attach
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalPortal>
      </Modal>

      <Modal open={multiOpen} onOpenChange={setMultiOpen}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Attach several documents</ModalTitle>
              <ModalDescription>
                The list stays open while you toggle. Scroll it, tick a few,
                then close.
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <Combobox
                aria-label="Multiple document picker"
                options={documents}
                value={multiValue}
                onValueChange={setMultiValue}
                multiple
                placeholder="Search documents"
              />
              <p style={{ margin: "12px 0 0" }}>
                {multiSelected.length > 0
                  ? `Attached: ${multiSelected.map((d) => d.label).join(", ")}`
                  : "Nothing attached yet."}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setMultiOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setMultiOpen(false)}>
                Attach
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </div>
  );
}
