import { Notice } from "@rfdtech/components";

export function NoticeVariantsExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Notice
        variant="warning"
        leftBorder
        dashed
        title="Your scope for this composer"
      >
        <ul>
          <li>
            Templates: Admissions Directorate only · Audience: 4 pre-approved
            groups · Classification: Standard only · Channels: Email, Portal.
          </li>
          <li>
            Only what&apos;s listed above appears below — there&apos;s
            nothing hidden or disabled to request access to. Contact CCP
            Comms Admin if you need a new template or group.
          </li>
        </ul>
      </Notice>

      <Notice
        variant="success"
        icon={
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
        }
      >
        This will send directly. Standard classification within your assigned
        scope meets direct-send policy criteria — no approval routing
        required (SRS-S074-C-01).
      </Notice>

      <Notice variant="info" title="Info">
        Neutral, non-blocking information for the current context.
      </Notice>

      <Notice variant="error" title="Something went wrong">
        The request could not be completed. Try again in a moment.
      </Notice>

      <Notice color="#7c3aed" title="Custom accent color">
        Any CSS color can be passed via the `color` prop when none of the
        built-in variants fit.
      </Notice>
    </div>
  );
}
