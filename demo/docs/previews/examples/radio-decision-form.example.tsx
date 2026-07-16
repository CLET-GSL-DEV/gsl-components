import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Form,
  FormField,
  Radio,
  RadioGroup,
  Textarea,
} from "@rfdtech/components";

const decisionSchema = z
  .object({
    verdict: z.enum(["approve", "reject", "needs_changes"]),
    reason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // `reason` is only required when the verdict isn't a clean approval.
    if (data.verdict === "approve") return;
    const trimmed = (data.reason ?? "").trim();
    if (trimmed.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide a reason of at least 10 characters.",
        path: ["reason"],
      });
    }
  });

type DecisionFormValues = z.infer<typeof decisionSchema>;

function DecisionFormFields() {
  const form = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: {
      verdict: "approve",
      reason: "",
    },
  });

  const verdict = form.watch("verdict");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => {})}
        style={{ display: "grid", gap: 16, maxWidth: 480 }}
      >
        <FormField
          control={form.control}
          name="verdict"
          render={({ field }) => (
            <Field>
              <FieldLabel>Recommendation</FieldLabel>
              <FieldControl>
                <RadioGroup
                  variant="card"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <Radio
                    value="approve"
                    label="Approve"
                    description="The submission meets all requirements as-is."
                  />
                  <Radio
                    value="needs_changes"
                    label="Needs changes"
                    description="Minor issues must be addressed before approval."
                  />
                  <Radio
                    value="reject"
                    label="Reject"
                    description="The submission does not meet requirements."
                  />
                </RadioGroup>
              </FieldControl>
            </Field>
          )}
        />

        {verdict !== "approve" && (
          <FormField
            control={form.control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel>Reason</FieldLabel>
                <FieldControl>
                  <Textarea
                    placeholder="Explain the reasoning behind this decision..."
                    rows={4}
                    {...field}
                  />
                </FieldControl>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        )}

        <Button type="submit" variant="primary">
          Submit recommendation
        </Button>
      </form>
    </Form>
  );
}

export function RadioDecisionFormExample() {
  return <DecisionFormFields />;
}
