import { Draggable } from "@rfdtech/components";

export function DraggableRootExample() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 360,
        height: 240,
        border: "1px dashed var(--clet-border)",
        borderRadius: "var(--clet-radius-base)",
        background: "var(--clet-surface-subtle)",
        overflow: "hidden",
      }}
    >
      <Draggable defaultPosition={{ x: 24, y: 24 }} bounds="parent">
        <div
          style={{
            padding: 12,
            border: "1px solid var(--clet-border)",
            borderRadius: "var(--clet-radius-base)",
            background: "var(--clet-bg)",
            boxShadow: "0 1px 2px color-mix(in srgb, var(--clet-text) 8%, transparent)",
            maxWidth: 220,
            cursor: "grab",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600 }}>Draggable card</div>
          <div style={{ fontSize: 13, color: "var(--clet-text-secondary)" }}>
            Drag anywhere on the card to reposition within the canvas.
          </div>
        </div>
      </Draggable>
    </div>
  );
}
