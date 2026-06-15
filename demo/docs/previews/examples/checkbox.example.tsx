import { useState } from "react";
import { Checkbox } from "@rfdtech/components";

export function CheckboxExample() {
  const [terms, setTerms] = useState(false);
  const [updates, setUpdates] = useState(true);

  return (
    <>
      <Checkbox
        label="Accept terms and conditions"
        checked={terms}
        onCheckedChange={setTerms}
      />
      <Checkbox
        label="Send me product updates"
        checked={updates}
        onCheckedChange={setUpdates}
      />
      <Checkbox label="Disabled option" disabled />
    </>
  );
}
