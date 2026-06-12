import { describe, expect, it } from "vitest";
import { getPageCount, getPageRange } from "./utils";

describe("pagination utils", () => {
  it("calculates page count and range", () => {
    expect(getPageCount(25, 10)).toBe(3);
    expect(getPageRange(2, 10, 25)).toEqual({ start: 11, end: 20 });
    expect(getPageRange(1, 10, 0)).toEqual({ start: 0, end: 0 });
  });
});
