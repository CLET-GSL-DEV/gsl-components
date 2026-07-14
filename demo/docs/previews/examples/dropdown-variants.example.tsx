import { Dropdown } from "@rfdtech/components";
import { Check } from "lucide-react";
import { useState } from "react";

const options = [
  { value: "1", label: "Option A" },
  { value: "2", label: "Option B" },
];

export function DropdownVariantsExample() {
  const [value, setValue] = useState<string | null>("1");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "240px" }}>
      <Dropdown
        aria-label="Disabled field"
        value="1"
        onValueChange={() => {}}
        options={options}
        disabled
      />

      <Dropdown
        aria-label="Custom rendering"
        value={value}
        onValueChange={setValue}
        options={options}
        formatOption={(option, state) => {
          if (state === "empty") return <span>Pick one...</span>;
          if (state === "selected") {
            return (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Check size={14} />
                <span>{option!.label}</span>
              </span>
            );
          }
          return <span>{option!.label}</span>;
        }}
      />
    </div>
  );
}
