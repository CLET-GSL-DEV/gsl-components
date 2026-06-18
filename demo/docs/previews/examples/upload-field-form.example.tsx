import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Form,
  FormField,
  UploadField,
} from "@rfdtech/components";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MIN_SIZE = 1024; // 1 KB
const MAX_NAME_LENGTH = 100;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const uploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine((f) => ACCEPTED_TYPES.includes(f.type), {
      message: "Only PNG, JPEG, and PDF files are accepted",
    })
    .refine((f) => f.size >= MIN_SIZE, {
      message: "File must be at least 1 KB",
    })
    .refine((f) => f.size <= MAX_SIZE, {
      message: "File size must be 5 MB or less",
    })
    .refine((f) => f.name.length <= MAX_NAME_LENGTH, {
      message: "File name must be 100 characters or less",
    }),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export function UploadFieldFormExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    fileName?: string;
    fileSize?: number;
  } | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { file: undefined },
  });

  function onSubmit(data: UploadFormValues) {
    const file = data.file!;
    setResult({ success: true, fileName: file.name, fileSize: file.size });
    setDialogOpen(true);
  }

  function onInvalid() {
    setResult({ success: false });
    setDialogOpen(true);
  }

  return (
    <div style={{ maxWidth: 480, width: "100%" }}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          style={{ display: "grid", gap: 16, width: "100%" }}
        >
          <FormField
            control={form.control}
            name="file"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error} style={{ minWidth: "100%", flex: 1 }}>
                <FieldLabel>Upload file</FieldLabel>
                <FieldControl>
                  <div style={{ width: "100%" }}>
                    <UploadField
                    accept=".png,.jpg,.jpeg,.pdf"
                    maxSize={MAX_SIZE}
                    value={field.value ?? null}
                    onChange={field.onChange}
                    name={field.name}
                    ref={field.ref}
                  />
                  </div>
                </FieldControl>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
          <Button type="submit" variant="primary" style={{ width: "100%" }}>
            Submit
          </Button>
        </form>
      </Form>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton>
          <DialogTitle>
            {result?.success ? "File accepted" : "Validation failed"}
          </DialogTitle>
          <DialogDescription>
            {result?.success
              ? `"${result.fileName}" (${formatSize(result.fileSize!)}) is valid.`
              : "Please fix the validation errors and try again."}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
