import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Field,
  FieldControl,
  FieldLabel,
  FieldError,
  Form,
  FormField,
  UploadField,
} from "@rfdtech/components";

function Preview({ file }: { file: File | null }) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [file]);

  if (!file) return null;

  return (
    <div style={{ fontSize: 14, color: "var(--gsl-text-secondary)", marginTop: 8 }}>
      {preview ? (
        <img
          src={preview}
          alt={file.name}
          style={{
            maxWidth: "100%",
            maxHeight: 160,
            borderRadius: "var(--gsl-radius)",
            objectFit: "cover",
          }}
        />
      ) : (
        <span>Selected: <strong>{file.name}</strong></span>
      )}
    </div>
  );
}

export function UploadFieldRhfExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  const form = useForm<{ file: File | null }>({
    defaultValues: { file: null },
  });

  const watchedFile = form.watch("file");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          const file = data.file;
          if (file) {
            setSubmitted(`Uploaded: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`);
          }
        })}
        style={{ display: "grid", gap: 16, maxWidth: 420 }}
      >
        <FormField
          control={form.control}
          name="file"
          rules={{ required: "Please select a file" }}
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel>Profile photo</FieldLabel>
              <FieldControl>
                <UploadField
                  accept="image/*,.pdf"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Upload a photo or PDF"
                />
              </FieldControl>
              <Preview file={watchedFile} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Button type="submit" variant="primary">
          Submit
        </Button>

        {submitted && (
          <p style={{ fontSize: 14, color: "var(--gsl-success)", margin: 0 }}>
            {submitted}
          </p>
        )}
      </form>
    </Form>
  );
}
