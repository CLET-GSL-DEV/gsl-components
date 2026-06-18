import { UploadField } from "@rfdtech/components";

export function UploadFieldExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
      <UploadField accept=".csv" maxSize={10 * 1024 * 1024} onChange={(f) => console.log(f)} />
      <UploadField invalid />
      <UploadField disabled />
    </div>
  );
}
