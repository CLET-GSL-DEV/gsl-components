import { CheckboxExample } from "../examples/checkbox.example";

export function CheckboxPreview() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      <CheckboxExample />
    </div>
  );
}
