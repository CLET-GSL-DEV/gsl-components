import { Notice } from "@rfdtech/components";
import type { NoticeVariant } from "@rfdtech/components";

const dot = (
  <span
    style={{
      display: "inline-block",
      width: 8,
      height: 8,
      marginTop: 6,
      borderRadius: "50%",
      background: "currentcolor",
    }}
  />
);

const ROWS: { variant: NoticeVariant; message: string }[] = [
  {
    variant: "info",
    message: "This field is optional if you are applying under the equity provision.",
  },
  { variant: "success", message: "Document uploaded and virus scan passed." },
  { variant: "warning", message: "This section will be locked once you continue." },
  {
    variant: "error",
    message: "We need a valid email address. The one entered does not include an @.",
  },
];

export function NoticeInlineExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {ROWS.map((row) => (
        <Notice key={row.variant} variant={row.variant} icon={dot}>
          {row.message}
        </Notice>
      ))}
    </div>
  );
}
