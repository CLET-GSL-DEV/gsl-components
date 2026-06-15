import { describe, expect, it } from "vitest";
import {
  clearOverlayData,
  readOverlayData,
  writeOverlayData,
} from "./overlaySearchParamData";

describe("overlaySearchParamData", () => {
  it("writes scalar fields with a param prefix", () => {
    const params = new URLSearchParams();

    writeOverlayData(params, "dialog", {
      userId: "42",
      tab: "profile",
      active: true,
      skipped: null,
    });

    expect(params.get("dialog")).toBeNull();
    expect(params.get("dialog.userId")).toBe("42");
    expect(params.get("dialog.tab")).toBe("profile");
    expect(params.get("dialog.active")).toBe("true");
    expect(params.get("dialog.skipped")).toBeNull();
  });

  it("reads prefixed fields into a flat record", () => {
    const params = new URLSearchParams(
      "dialog=edit-user&dialog.userId=42&dialog.tab=profile&other=value",
    );

    expect(readOverlayData(params, "dialog")).toEqual({
      userId: "42",
      tab: "profile",
    });
  });

  it("clears only keys matching the data prefix", () => {
    const params = new URLSearchParams(
      "dialog=edit-user&dialog.userId=42&modal.userId=99",
    );

    clearOverlayData(params, "dialog");

    expect(params.get("dialog")).toBe("edit-user");
    expect(params.get("dialog.userId")).toBeNull();
    expect(params.get("modal.userId")).toBe("99");
  });

  it("supports a custom data prefix", () => {
    const params = new URLSearchParams();

    writeOverlayData(params, "dialog", { userId: "1" }, "dlg.");
    expect(params.get("dlg.userId")).toBe("1");

    expect(readOverlayData(params, "dialog", "dlg.")).toEqual({
      userId: "1",
    });
  });
});
