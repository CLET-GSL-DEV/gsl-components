import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Form,
  FormField,
  PhoneNumberInput,
} from "@rfdtech/components";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+\d{7,15}$/, "Please enter a valid phone number"),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export function PhoneNumberInputFormExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    phone: string;
  } | null>(null);

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  function onSubmit(data: PhoneFormValues) {
    setResult({ success: true, phone: data.phone });
    setDialogOpen(true);
  }

  function onInvalid() {
    setResult({ success: false, phone: "" });
    setDialogOpen(true);
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          style={{ display: "grid", gap: 16, maxWidth: 360 }}
        >
          <FormField
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel>Phone number</FieldLabel>
                <FieldControl>
                  <PhoneNumberInput
                    value={field.value}
                    onChange={field.onChange}
                    name={field.name}
                    ref={field.ref}
                  />
                </FieldControl>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
          <Button type="submit" variant="primary">
            Validate phone
          </Button>
        </form>
      </Form>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton>
          <DialogTitle>
            {result?.success ? "Valid phone number" : "Validation failed"}
          </DialogTitle>
          <DialogDescription>
            {result?.success
              ? `The phone number ${result.phone} is valid.`
              : "Please fix the validation errors and try again."}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
