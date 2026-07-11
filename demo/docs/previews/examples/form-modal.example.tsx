import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Dropdown,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Form,
  FormField,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
} from "@rfdtech/components";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  roleId: z.string().min(1, "Select a role"),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

interface RoleOption {
  value: string;
  label: string;
}

/** Simulates fetching a roles list from the server. */
function loadRoles(): Promise<RoleOption[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ]);
    }, 900);
  });
}

/** Simulates an async create-user API call. Rejects for a "taken" email so
 * the failure path (root-level form error) is exercised too. */
function createUser(values: CreateUserValues): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (values.email === "taken@example.com") {
        reject(new Error("A user with this email already exists."));
        return;
      }
      resolve();
    }, 1200);
  });
}

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const [roles, setRoles] = useState<RoleOption[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadRoles().then((options) => {
      if (!cancelled) setRoles(options);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", roleId: "" },
  });

  const onSubmit = async (values: CreateUserValues) => {
    try {
      await createUser(values);
      onDone();
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    }
  };

  const rolesLoading = roles === null;

  return (
    <Form {...form}>
      <ModalBody style={{ display: "grid", gap: 16 }}>
        {form.formState.errors.root ? (
          <div
            role="alert"
            style={{
              padding: "10px 12px",
              borderRadius: "var(--gsl-radius-base)",
              background: "var(--gsl-error-bg, #fef2f2)",
              color: "var(--gsl-error-text, #b91c1c)",
              fontSize: 14,
            }}
          >
            {form.formState.errors.root.message}
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel>Full name</FieldLabel>
              <FieldControl>
                <Input placeholder="Ama Serwaa" {...field} />
              </FieldControl>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel>Email</FieldLabel>
              <FieldControl>
                <Input type="email" placeholder="ama@gsl.edu.gh" {...field} />
              </FieldControl>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <FormField
          control={form.control}
          name="roleId"
          render={({ field, fieldState }) => (
            <Field invalid={!!fieldState.error}>
              <FieldLabel>Role</FieldLabel>
              <FieldControl>
                <Dropdown
                  aria-label="Role"
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  options={roles ?? []}
                  disabled={rolesLoading}
                  placeholder={rolesLoading ? "Loading roles…" : "Select a role"}
                  invalid={!!fieldState.error}
                />
              </FieldControl>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" type="button" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="button"
          loading={form.formState.isSubmitting}
          loadingLabel="Creating…"
          onClick={() => form.handleSubmit(onSubmit)()}
        >
          Create user
        </Button>
      </ModalFooter>
    </Form>
  );
}

export function FormModalExample() {
  const [open, setOpen] = useState(true);
  // Remounts the form (and its async role-loading effect) each time the
  // modal is reopened, mirroring how a real "create" modal starts fresh.
  const [formKey, setFormKey] = useState(0);

  const openModal = () => {
    setFormKey((k) => k + 1);
    setOpen(true);
  };

  return (
    <>
      <Button variant="secondary" onClick={openModal}>
        Add user
      </Button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent showCloseButton size="md">
            <ModalHeader>
              <ModalTitle>Add user</ModalTitle>
            </ModalHeader>
            <CreateUserForm key={formKey} onDone={() => setOpen(false)} />
          </ModalContent>
        </ModalPortal>
      </Modal>
    </>
  );
}
