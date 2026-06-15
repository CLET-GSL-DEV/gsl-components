import { describe, expect, it } from "vitest";
import { reorderItems } from "./useSortableDragEnd";

describe("reorderItems", () => {
  it("returns the same array when active and over ids match", () => {
    const items = ["a", "b", "c"];
    expect(reorderItems(items, "b", "b")).toBe(items);
  });

  it("returns the same array when over id is null", () => {
    const items = ["a", "b", "c"];
    expect(reorderItems(items, "a", null)).toBe(items);
  });

  it("returns the same array when ids are not found", () => {
    const items = ["a", "b", "c"];
    expect(reorderItems(items, "missing", "b")).toBe(items);
    expect(reorderItems(items, "a", "missing")).toBe(items);
  });

  it("moves an item to a new index", () => {
    const items = ["a", "b", "c"];
    expect(reorderItems(items, "a", "c")).toEqual(["b", "c", "a"]);
    expect(reorderItems(items, "c", "a")).toEqual(["c", "a", "b"]);
  });

  it("supports numeric ids", () => {
    const items = [1, 2, 3];
    expect(reorderItems(items, 1, 3)).toEqual([2, 3, 1]);
  });
});
