import { PhoneNumberInput } from "@rfdtech/components";
import { useState } from "react";

export function PhoneNumberInputExample() {
  const [val, setVal] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>Default</p>
        <PhoneNumberInput value={val} onChange={setVal} />
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gsl-text-muted)" }}>Value: {val || "(empty)"}</p>
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>Invalid</p>
        <PhoneNumberInput invalid />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>Disabled</p>
        <PhoneNumberInput disabled />
      </div>
    </div>
  );
}
