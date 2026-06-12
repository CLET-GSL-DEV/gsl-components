import { useState } from "react";
import { INPUT_MASK_PRESETS, InputMask } from "@rfdtech/components";

export function InputMaskPreview() {
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="demo-input-masks">
      <InputMask
        ariaLabel="Phone number"
        mask={INPUT_MASK_PRESETS.phoneGh}
        value={phone}
        onChange={setPhone}
        placeholder="0XX XXX XXXX"
        inputMode="tel"
        className="demo-input-mask"
      />
      <InputMask
        ariaLabel="Date of birth"
        mask={INPUT_MASK_PRESETS.date}
        value={date}
        onChange={setDate}
        placeholder="DD/MM/YYYY"
        inputMode="numeric"
        className="demo-input-mask"
      />
    </div>
  );
}
