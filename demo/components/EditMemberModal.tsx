import { useForm } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalClose,
  Button,
  Input,
  Select,
  CountrySelector,
  NetworkOperator,
  PhoneNumberInput,
  Form,
  FormField,
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
} from "@rfdtech/components";
import type { DemoMember } from "../data/demoMembers";

interface EditMemberFormValues {
  name: string;
  email: string;
  role: string;
  isr: string;
  phone: string;
  country: string;
  operator: string;
}

interface EditMemberModalProps {
  member: DemoMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_OPTIONS = [
  { value: "NBEC Member", label: "NBEC Member" },
  { value: "NBEC Secretariat", label: "NBEC Secretariat" },
  { value: "Item Writer", label: "Item Writer" },
  { value: "Moderator", label: "Moderator" },
  { value: "Examiner", label: "Examiner" },
  { value: "Candidate", label: "Candidate" },
  { value: "System Administrator", label: "System Administrator" },
];

export function EditMemberModal({
  member,
  open,
  onOpenChange,
}: EditMemberModalProps) {
  const form = useForm<EditMemberFormValues>({
    defaultValues: {
      name: member?.name ?? "",
      email: member?.email ?? "",
      role: member?.role ?? "",
      isr: member?.isr ?? "",
      phone: member?.phone ?? "",
      country: member?.country ?? "GH",
      operator: member?.operator ?? "",
    },
    values: member
      ? {
          name: member.name,
          email: member.email,
          role: member.role,
          isr: member.isr,
          phone: member.phone,
          country: member.country,
          operator: member.operator,
        }
      : undefined,
  });

  const onSubmit = (data: EditMemberFormValues) => {
    console.log("Saved:", data);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent showCloseButton>
        <ModalHeader>
          <ModalTitle>Edit Member</ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="demo-form">
            <ModalBody>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FormField
                  name="name"
                  control={form.control}
                  rules={{ required: "Name is required" }}
                  render={({ field, fieldState }) => (
                    <Field invalid={!!fieldState.error}>
                      <FieldLabel>Full Name</FieldLabel>
                      <FieldControl>
                        <Input {...field} placeholder="John Doe" />
                      </FieldControl>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <FormField
                  name="email"
                  control={form.control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+$/,
                      message: "Invalid email",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <Field invalid={!!fieldState.error}>
                      <FieldLabel>Email</FieldLabel>
                      <FieldControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="email@example.com"
                        />
                      </FieldControl>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <FormField
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field invalid={!!fieldState.error}>
                      <FieldLabel>Phone Number</FieldLabel>
                      <FieldControl>
                        <PhoneNumberInput
                          value={field.value}
                          onChange={field.onChange}
                          defaultCountry={
                            (member?.country as "GH" | undefined) ?? "GH"
                          }
                          invalid={!!fieldState.error}
                        />
                      </FieldControl>
                      <FieldDescription>
                        Format: country code + number
                      </FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <FormField
                      name="country"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field invalid={!!fieldState.error}>
                          <FieldLabel>Country</FieldLabel>
                          <FieldControl>
                            <CountrySelector
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              invalid={!!fieldState.error}
                            />
                          </FieldControl>
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <FormField
                      name="operator"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field invalid={!!fieldState.error}>
                          <FieldLabel>Network Operator</FieldLabel>
                          <FieldControl>
                            <NetworkOperator
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              invalid={!!fieldState.error}
                            />
                          </FieldControl>
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <FormField
                      name="role"
                      control={form.control}
                      rules={{ required: "Role is required" }}
                      render={({ field, fieldState }) => (
                        <Field invalid={!!fieldState.error}>
                          <FieldLabel>Primary Role</FieldLabel>
                          <FieldControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              options={ROLE_OPTIONS}
                              placeholder="Select role..."
                              invalid={!!fieldState.error}
                            />
                          </FieldControl>
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <FormField
                      name="isr"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field invalid={!!fieldState.error}>
                          <FieldLabel>ISR Number</FieldLabel>
                          <FieldControl>
                            <Input {...field} placeholder="ISR-123456" />
                          </FieldControl>
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <ModalClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </ModalClose>
              <Button type="submit">Save Changes</Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
}
