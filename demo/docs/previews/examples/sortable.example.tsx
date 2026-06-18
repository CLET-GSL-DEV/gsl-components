import { useState } from "react";
import {
  Sortable,
  SortableHandle,
  SortableItem,
  SortableList,
} from "@rfdtech/components";

const labels: Record<string, string> = {
  alpha: "Review submissions",
  beta: "Approve grades",
  gamma: "Publish results",
  delta: "Send notifications",
};

export function SortableExample() {
  const [items, setItems] = useState(["alpha", "beta", "gamma", "delta"]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 360,
        padding: 12,
        border: "1px dashed var(--gsl-border)",
        borderRadius: "var(--gsl-radius-base)",
        background: "var(--gsl-surface-subtle)",
      }}
    >
      <Sortable items={items} onReorder={setItems}>
        <SortableList>
          {items.map((id) => (
            <SortableItem key={id} id={id}>
              <SortableHandle aria-label={`Reorder ${labels[id]}`} />
              <span style={{ fontSize: 14 }}>{labels[id]}</span>
            </SortableItem>
          ))}
        </SortableList>
      </Sortable>
    </div>
  );
}
