import { UploadField } from "@rfdtech/components";
import { useState } from "react";

export function UploadFieldMultipleExample() {
  const [files, setFiles] = useState<File[] | null>(null);

  return (
    <UploadField
      multiple
      accept="image/*,.pdf"
      value={files}
      onChange={(v) => setFiles(v as File[] | null)}
    />
  );
}
