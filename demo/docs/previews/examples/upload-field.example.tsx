import { UploadField } from "@rfdtech/components";

export function UploadFieldExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>
          Single file
        </p>
        <UploadField accept="image/*" placeholder="Upload an image" />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>
          Multiple files
        </p>
        <UploadField multiple placeholder="Upload images, PDFs, or videos" />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>
          Invalid state
        </p>
        <UploadField invalid placeholder="This field has an error" />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>
          Disabled
        </p>
        <UploadField disabled placeholder="Uploads are disabled" />
      </div>
    </div>
  );
}
