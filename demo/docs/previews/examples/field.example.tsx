import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Input,
  Textarea,
} from "@rfdtech/components";

export function FieldExample() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <Input type="email" placeholder="you@example.com" />
        </FieldControl>
        <FieldDescription>We will never share your email.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl>
          <Textarea rows={4} placeholder="How can we help?" />
        </FieldControl>
      </Field>
    </div>
  );
}
