import { PhoneNumberInput } from "@rfdtech/components";

export function PhoneNumberInputExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--clet-text-secondary)" }}>Default</p>
        <PhoneNumberInput onChange={(v) => console.log(v)} />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--clet-text-secondary)" }}>Invalid</p>
        <PhoneNumberInput invalid />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--clet-text-secondary)" }}>Disabled</p>
        <PhoneNumberInput disabled />
      </div>
    </div>
  );
}
