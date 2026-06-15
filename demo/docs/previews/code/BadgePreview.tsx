import { BadgeVariantsExample } from "../examples/badge-variants.example";

export function BadgePreview() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        justifyContent: "center",
      }}
    >
      <BadgeVariantsExample />
    </div>
  );
}
