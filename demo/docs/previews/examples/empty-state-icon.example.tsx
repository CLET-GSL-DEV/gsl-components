import { Button, EmptyState } from "@rfdtech/components";

export function EmptyStateIconExample() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 24,
      }}
    >
      <EmptyState
        icon="+"
        title="No applications yet"
        description="Applications you submit for accreditation will appear here."
        action={
          <Button variant="primary" size="md">
            Start a new application
          </Button>
        }
      />
      <EmptyState
        icon="?"
        title="No matching results"
        description="Try removing a filter or adjusting your search terms."
      />
      <EmptyState
        icon="!"
        title="Nothing to review"
        description="There are no cases assigned to you at this time."
      />
    </div>
  );
}
