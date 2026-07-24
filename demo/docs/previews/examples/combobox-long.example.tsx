import { Combobox } from "@rfdtech/components";
import { useState } from "react";

const options = Array.from({ length: 20 }, (_, i) => ({
  value: String(i + 1),
  label: `Option ${i + 1}`,
}));

export function ComboboxLongExample() {
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
