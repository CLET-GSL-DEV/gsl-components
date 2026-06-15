import { arrayMove } from "@dnd-kit/sortable";
import type { SortableId } from "../../../types/sortable";

export function reorderItems(
  items: SortableId[],
  activeId: SortableId,
  overId: SortableId | null | undefined,
): SortableId[] {
  if (overId == null || activeId === overId) {
    return items;
  }

  const oldIndex = items.indexOf(activeId);
  const newIndex = items.indexOf(overId);

  if (oldIndex === -1 || newIndex === -1) {
    return items;
  }

  return arrayMove(items, oldIndex, newIndex);
}
