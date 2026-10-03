import { DocumentViewer } from "@rfdtech/components";

/** Tiny 1x1 PNG used only for the docs image preview. */
const SAMPLE_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function DocumentViewerImageExample() {
  return (
    <div style={{ height: 320 }}>
      <DocumentViewer
        src={SAMPLE_PNG}
        name="sample.png"
        type="image"
      />
    </div>
  );
}
