import { DocumentViewer } from "@rfdtech/components";

/** Tiny 1x1 PNG used only for the docs gallery preview. */
const SAMPLE_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function DocumentViewerGalleryExample() {
  return (
    <div
      style={{
        height: 720,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <DocumentViewer
        documents={[
          {
            src: "/samples/file-sample_150kB.pdf#view=FitH",
            name: "file-sample_150kB.pdf",
            type: "pdf",
          },
          {
            src: SAMPLE_PNG,
            name: "sample.png",
            type: "image",
          },
          {
            src: "https://example.com/notes.docx",
            name: "notes.docx",
          },
        ]}
        style={{ flex: 1, minHeight: 0, height: "100%" }}
      />
    </div>
  );
}
