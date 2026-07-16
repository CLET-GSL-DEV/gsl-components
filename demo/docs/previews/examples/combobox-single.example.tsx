import { Combobox } from "@rfdtech/components";
import { useState } from "react";

const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
  { value: "5", label: "Option 5" },
];

export function ComboboxSingleExample() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Combobox
      aria-label="Select"
      placeholder="Select"
      options={options}
      value={value}
      onValueChange={setValue}
      clearable
    />
  );
}
