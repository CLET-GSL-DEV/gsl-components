import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Form,
  FormField,
  Input,
  Textarea,
} from "@rfdtech/components";

const contactFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

function ContactFormFields() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: "",
      message: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => {})}
        style={{ display: "grid", gap: 16, maxWidth: 420 }}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel>Email</FieldLabel>
              <FieldControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FieldControl>
              <FieldDescription>We will never share your email.</FieldDescription>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel>Message</FieldLabel>
              <FieldControl>
                <Textarea placeholder="How can we help?" rows={4} {...field} />
              </FieldControl>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Button type="submit" variant="primary">
          Send message
        </Button>
      </form>
    </Form>
  );
}

export function FormExample() {
  return <ContactFormFields />;
}
