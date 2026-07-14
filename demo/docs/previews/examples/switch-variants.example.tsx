import { Switch } from "@rfdtech/components";
import { useState } from "react";

export function SwitchVariantsExample() {
  const [checked, setChecked] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Switch aria-label="Unchecked" checked={false} onCheckedChange={() => {}} />
        <Switch aria-label="Checked" checked onCheckedChange={() => {}} />
        <Switch aria-label="Disabled unchecked" disabled />
        <Switch aria-label="Disabled checked" disabled defaultChecked />
      </div>
      <Switch
        label="Notify me about updates"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Switch
        label="Left-aligned label"
        labelPosition="left"
        defaultChecked
      />
    </div>
  );
}
