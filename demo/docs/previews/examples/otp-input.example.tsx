import { OtpInput } from "@rfdtech/components";

export function OtpInputExample() {
  return (
    <div>
      <OtpInput />
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--gsl-text-muted)" }}>
        Enter 6-digit code
      </p>
    </div>
  );
}
