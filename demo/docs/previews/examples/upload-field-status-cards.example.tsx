import { UploadField } from "@rfdtech/components";
import type { UploadFieldFileStatus } from "@rfdtech/components";

function fakeFile(name: string, type: string, size: number) {
  return new File([new ArrayBuffer(size)], name, { type });
}

const files = [
  fakeFile("my-cv.pdf", "application/pdf", 120 * 1024),
  fakeFile("my-cv.pdf", "application/pdf", 120 * 1024),
  fakeFile("my-cv.pdf", "application/pdf", 120 * 1024),
];

const statuses: UploadFieldFileStatus[] = [
  { status: "uploading", progress: 45 },
  { status: "completed" },
  { status: "failed", error: "Upload failed" },
];

export function UploadFieldStatusCardsExample() {
  return (
    <UploadField
      multiple
      value={files}
      fileStatuses={statuses}
      onChange={() => {}}
      onCancel={(file) => console.log("cancel", file.name)}
      onRetry={(file) => console.log("retry", file.name)}
    />
  );
}
