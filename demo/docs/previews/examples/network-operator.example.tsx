import { NetworkOperator } from "@rfdtech/components";

export function NetworkOperatorExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
      <NetworkOperator />
      <NetworkOperator invalid />
      <NetworkOperator disabled />
    </div>
  );
}
