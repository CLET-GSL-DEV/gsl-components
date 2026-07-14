import { Combobox } from "@rfdtech/components";
import { useState } from "react";

const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
];

export function ComboboxMultiExample() {
  const [value, setValue] = useState<string[]>(["2", "4"]);

  return (
    <Combobox
      aria-label="Select options"
      placeholder="Select"
      options={options}
      value={value}
      onValueChange={setValue}
      multiple
    />
  );
}
