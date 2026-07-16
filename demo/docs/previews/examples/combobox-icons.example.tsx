import { Combobox } from "@rfdtech/components";
import { Star } from "lucide-react";
import { useState } from "react";

const options = [
  { value: "1", label: "Option 1", icon: <Star size={16} /> },
  { value: "2", label: "Option 2", icon: <Star size={16} /> },
  { value: "3", label: "Option 3", icon: <Star size={16} /> },
];

export function ComboboxIconsExample() {
  const [value, setValue] = useState<string[]>(["1", "2"]);

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
