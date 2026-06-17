import { OtpInput } from "@rfdtech/components";
import { useState, type CSSProperties } from "react";

const container: CSSProperties = { display: "flex", flexDirection: "column", gap: 16 };

export function OtpInputExample() {
  const [val, setVal] = useState("");
  return (
    <div style={container}>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>Default (6 digits)</p>
        <OtpInput value={val} onChange={setVal} />
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gsl-text-muted)" }}>Value: {val || "(empty)"}</p>
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>4 digits</p>
        <OtpInput length={4} />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>Invalid</p>
        <OtpInput invalid />
      </div>
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--gsl-text-secondary)" }}>Disabled</p>
        <OtpInput disabled value="123456" />
      </div>
    </div>
  );
}
