import { zodResolver } from "@hookform/resolvers/zod";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { describe, expect, it } from "vitest";
import { Button } from "../button/Button";
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "../field/Field";
import { Input } from "../input/Input";
import { Form, FormField } from "./Form";

const testFormSchema = z.object({
  email: z.string().min(1, "Email is required"),
});

type TestFormValues = z.infer<typeof testFormSchema>;

function TestForm() {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel>Email</FieldLabel>
              <FieldControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FieldControl>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("shows Zod validation errors after submit", async () => {
    render(<TestForm />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
    });

    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});
