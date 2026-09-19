import { Button, EmptyState } from "@rfdtech/components";

export function EmptyStateExample() {
  return (
    <EmptyState
      title="No certificates yet"
      description="Add certificates, policies, staff records and other evidence CLET needs to assess your application."
      action={
        <Button variant="primary" size="md">
          Add document
        </Button>
      }
    />
  );
}
