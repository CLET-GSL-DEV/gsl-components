import { DocumentViewer } from "@rfdtech/components";

export function DocumentViewerUnsupportedExample() {
  return (
    <div style={{ height: 280 }}>
      <DocumentViewer
        src="https://example.com/notes.docx"
        name="notes.docx"
      />
    </div>
  );
}
