import { useForm } from "react-hook-form";
import {
  Button,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Form,
  FormField,
  OtpInput,
} from "@rfdtech/components";

export function OtpInputRhfExample() {
  const form = useForm<{ code: string }>({
    defaultValues: { code: "" },
  });

  const watched = form.watch("code");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          console.log("OTP submitted:", data.code);
        })}
        style={{ display: "grid", gap: 16, maxWidth: 360 }}
      >
        <FormField
          control={form.control}
          name="code"
          rules={{ required: "Verification code is required", minLength: { value: 6, message: "Enter the full 6-digit code" } }}
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel>Verification code</FieldLabel>
              <FieldDescription>Enter the 6-digit code sent to your phone.</FieldDescription>
              <FieldControl>
                <OtpInput
                  length={6}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FieldControl>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <p style={{ margin: 0, fontSize: 13, color: "var(--gsl-text-muted)" }}>
          {watched ? `Code entered: ${watched}` : "Type to see the value update…"}
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <Button type="submit" variant="primary">
            Verify
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => form.reset({ code: "" })}
          >
            Clear
          </Button>
        </div>
      </form>
    </Form>
  );
}
