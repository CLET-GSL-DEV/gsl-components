import { describe, expect, it } from "vitest";
import { clampPosition } from "./clampPosition";

function createNode({
  offsetLeft = 24,
  offsetTop = 24,
  offsetWidth = 120,
  offsetHeight = 80,
  parentWidth = 320,
  parentHeight = 240,
  rectLeft = 24,
  rectTop = 24,
}: {
  offsetLeft?: number;
  offsetTop?: number;
  offsetWidth?: number;
  offsetHeight?: number;
  parentWidth?: number;
  parentHeight?: number;
  rectLeft?: number;
  rectTop?: number;
} = {}) {
  const parent = {
    clientWidth: parentWidth,
    clientHeight: parentHeight,
  } as HTMLElement;

  const node = {
    offsetLeft,
    offsetTop,
    offsetWidth,
    offsetHeight,
    offsetParent: parent,
    getBoundingClientRect: () =>
      ({
        left: rectLeft,
        top: rectTop,
        width: offsetWidth,
        height: offsetHeight,
      }) as DOMRect,
  } as unknown as HTMLElement;

  return node;
}

describe("clampPosition", () => {
  it("clamps within parent bounds", () => {
    const node = createNode();

    expect(
      clampPosition({
        position: { x: 500, y: 500 },
        currentPosition: { x: 0, y: 0 },
        axis: "both",
        bounds: "parent",
        node,
      }),
    ).toEqual({ x: 176, y: 136 });
  });

  it("locks movement to the x axis", () => {
    const node = createNode();

    expect(
      clampPosition({
        position: { x: 40, y: 200 },
        currentPosition: { x: 0, y: 10 },
        axis: "x",
        bounds: "parent",
        node,
      }),
    ).toEqual({ x: 40, y: 10 });
  });

  it("applies custom numeric bounds", () => {
    const node = createNode();

    expect(
      clampPosition({
        position: { x: 100, y: 100 },
        currentPosition: { x: 0, y: 0 },
        axis: "both",
        bounds: { left: 0, right: 48, top: 0, bottom: 32 },
        node,
      }),
    ).toEqual({ x: 48, y: 32 });
  });

  it("clamps within the viewport for window bounds", () => {
    const node = createNode({
      rectLeft: 10,
      rectTop: 10,
    });

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 200,
    });

    expect(
      clampPosition({
        position: { x: 400, y: 400 },
        currentPosition: { x: 0, y: 0 },
        axis: "both",
        bounds: "window",
        node,
      }),
    ).toEqual({ x: 170, y: 110 });
  });
});
