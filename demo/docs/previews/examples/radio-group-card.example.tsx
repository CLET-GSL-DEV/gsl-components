import { useState } from "react";
import { Radio, RadioGroup } from "@rfdtech/components";

export function RadioGroupCardExample() {
  const [plan, setPlan] = useState("starter");

  return (
    <RadioGroup variant="card" value={plan} onValueChange={setPlan}>
      <Radio
        value="starter"
        label="Starter"
        description="For individuals getting started."
      />
      <Radio
        value="team"
        label="Team"
        description="Collaborate with up to 10 members."
      />
      <Radio
        value="enterprise"
        label="Enterprise"
        description="Advanced controls and dedicated support."
      />
    </RadioGroup>
  );
}
