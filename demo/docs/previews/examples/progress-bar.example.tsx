import { ProgressBar } from "@rfdtech/components";

export function ProgressBarExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <ProgressBar value={60} label="Upload progress" showValue />
      <ProgressBar value={100} variant="success" showValue />
      <ProgressBar value={45} variant="warning" />
      <ProgressBar value={20} variant="error" size="md" />
      <ProgressBar indeterminate label="Loading" size="md" />
    </div>
  );
}
