import { useState } from "react";
import { Radio, RadioGroup } from "@rfdtech/components";

export function RadioGroupExample() {
  const [method, setMethod] = useState("email");

  return (
    <RadioGroup value={method} onValueChange={setMethod}>
      <Radio value="email" label="Email" />
      <Radio value="sms" label="SMS" />
      <Radio value="phone" label="Phone" disabled />
    </RadioGroup>
  );
}
