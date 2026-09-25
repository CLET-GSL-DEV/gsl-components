import { useState } from "react";
import { UploadField } from "@rfdtech/components";

const sampleFile = new File(["cv-bytes"], "Joseph-Mawule-Mensah-CV.pdf", {
  type: "application/pdf",
});

export function UploadFieldInlineExample() {
  const [file, setFile] = useState<File | File[] | null>(sampleFile);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
      <UploadField
        aria-label="Upload your CV"
        variant="inline"
        accept=".pdf"
        maxSize={5 * 1024 * 1024}
        onChange={(f) => console.log(f)}
      />
      <UploadField
        aria-label="Replace your CV"
        variant="inline"
        accept=".pdf"
        maxSize={5 * 1024 * 1024}
        value={file}
        onChange={setFile}
      />
      <UploadField aria-label="Upload a file" variant="inline" disabled />
    </div>
  );
}
