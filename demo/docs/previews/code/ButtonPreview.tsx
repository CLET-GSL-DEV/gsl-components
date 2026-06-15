import { ButtonVariantsExample } from "../examples/button-variants.example";

export function ButtonPreview() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        justifyContent: "center",
      }}
    >
      <ButtonVariantsExample />
    </div>
  );
}
