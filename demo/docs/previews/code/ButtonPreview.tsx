import { Button } from "@rfdtech/components";

export function ButtonPreview() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button loading loadingLabel="Saving">
        Loading
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
