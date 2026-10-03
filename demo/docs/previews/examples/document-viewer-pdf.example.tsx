import { DocumentViewer } from "@rfdtech/components";

export function DocumentViewerPdfExample() {
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
        src="/samples/file-sample_150kB.pdf#view=FitH"
        name="file-sample_150kB.pdf"
        type="pdf"
        style={{ flex: 1, minHeight: 0, height: "100%" }}
      />
    </div>
  );
}
