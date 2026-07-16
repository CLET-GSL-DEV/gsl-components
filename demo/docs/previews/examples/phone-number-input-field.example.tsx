import { Info } from "lucide-react";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  PhoneNumberInput,
  Tooltip,
} from "@rfdtech/components";

function OptionalLabel() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      Phone Number <span style={{ fontWeight: 400 }}>(Optional)</span>
      <Tooltip content="We'll only use this to reach you about your application.">
        <Info size={14} style={{ color: "var(--clet-text-secondary)" }} />
      </Tooltip>
    </span>
  );
}

function Hint({ children }: { children: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Info size={14} style={{ flexShrink: 0 }} />
      {children}
    </span>
  );
}

export function PhoneNumberInputFieldExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: 360 }}>
      <Field>
        <FieldLabel>
          <OptionalLabel />
        </FieldLabel>
        <FieldControl>
          <PhoneNumberInput />
        </FieldControl>
        <FieldDescription>
          <Hint>This is a hint text to help user.</Hint>
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel>
          <OptionalLabel />
        </FieldLabel>
        <FieldControl>
          <PhoneNumberInput value="+18020000000" onChange={() => {}} />
        </FieldControl>
        <FieldDescription>
          <Hint>This is a hint text to help user.</Hint>
        </FieldDescription>
      </Field>

      <Field invalid>
        <FieldLabel>
          <OptionalLabel />
        </FieldLabel>
        <FieldControl>
          <PhoneNumberInput invalid value="+18020000000" onChange={() => {}} />
        </FieldControl>
        <FieldError>
          <Hint>This is a hint text to help user.</Hint>
        </FieldError>
      </Field>

      <Field>
        <FieldLabel>
          <OptionalLabel />
        </FieldLabel>
        <FieldControl>
          <PhoneNumberInput disabled />
        </FieldControl>
        <FieldDescription>
          <Hint>This is a hint text to help user.</Hint>
        </FieldDescription>
      </Field>
    </div>
  );
}
