import { useState } from "react";
import { Step, StepLabel, Stepper } from "@rfdtech/components";

const steps = [
  { value: 1, label: "Upload Document" },
  { value: 2, label: "Select header row" },
  { value: 3, label: "Match Columns" },
  { value: 4, label: "Validate data" },
];

export function StepperExample() {
  const [value, setValue] = useState(3);

  return (
    <section
      className="clet-card"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      <Stepper value={value} clickable onValueChange={setValue}>
        {steps.map((step) => (
          <Step key={step.value} value={step.value}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div style={{ display: "flex", gap: "8px", paddingTop: "32px" }}>
        <button
          type="button"
          className="clet-button clet-button--secondary"
          onClick={() => setValue((v) => Math.max(1, v - 1))}
          disabled={value === 1}
        >
          Back
        </button>
        <button
          type="button"
          className="clet-button clet-button--primary"
          onClick={() => setValue((v) => Math.min(steps.length, v + 1))}
          disabled={value === steps.length}
        >
          Next
        </button>
      </div>
    </section>
  );
}
