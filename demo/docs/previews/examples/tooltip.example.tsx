import { Tooltip } from "@rfdtech/components";

export function TooltipExample() {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
      }}
    >
      <Tooltip content="Top tooltip" side="top">
        <button
          type="button"
          style={{
            padding: "8px 14px",
            border: "1px solid var(--gsl-border)",
            borderRadius: "var(--gsl-radius-base)",
            background: "var(--gsl-bg)",
            color: "var(--gsl-text)",
            fontFamily: "var(--gsl-font)",
            fontSize: 14,
            cursor: "default",
          }}
        >
          Top
        </button>
      </Tooltip>
      <Tooltip content="Right tooltip" side="right">
        <button
          type="button"
          style={{
            padding: "8px 14px",
            border: "1px solid var(--gsl-border)",
            borderRadius: "var(--gsl-radius-base)",
            background: "var(--gsl-bg)",
            color: "var(--gsl-text)",
            fontFamily: "var(--gsl-font)",
            fontSize: 14,
            cursor: "default",
          }}
        >
          Right
        </button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" side="bottom">
        <button
          type="button"
          style={{
            padding: "8px 14px",
            border: "1px solid var(--gsl-border)",
            borderRadius: "var(--gsl-radius-base)",
            background: "var(--gsl-bg)",
            color: "var(--gsl-text)",
            fontFamily: "var(--gsl-font)",
            fontSize: 14,
            cursor: "default",
          }}
        >
          Bottom
        </button>
      </Tooltip>
      <Tooltip content="Left tooltip" side="left">
        <button
          type="button"
          style={{
            padding: "8px 14px",
            border: "1px solid var(--gsl-border)",
            borderRadius: "var(--gsl-radius-base)",
            background: "var(--gsl-bg)",
            color: "var(--gsl-text)",
            fontFamily: "var(--gsl-font)",
            fontSize: 14,
            cursor: "default",
          }}
        >
          Left
        </button>
      </Tooltip>
    </div>
  );
}
