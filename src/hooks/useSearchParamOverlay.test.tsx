import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createSearchParamAdapter } from "./createSearchParamAdapter";
import { useDialogSearchParam } from "./useDialogSearchParam";
import { useModalSearchParam } from "./useModalSearchParam";
import { useSearchParamOverlay } from "./useSearchParamOverlay";

function createTestSearchParamAdapter(initial = "") {
  let params = new URLSearchParams(initial);
  const listeners = new Set<() => void>();

  return {
    adapter: createSearchParamAdapter({
      get: () => params,
      set: (next, options) => {
        params = new URLSearchParams(next.toString());
        if (!options?.replace) {
          // no-op for tests; replace flag is asserted via spy below
        }
        listeners.forEach((listener) => listener());
      },
      subscribe: (onStoreChange) => {
        listeners.add(onStoreChange);
        return () => listeners.delete(onStoreChange);
      },
    }),
    getParams: () => params,
    setParams: (next: URLSearchParams) => {
      params = new URLSearchParams(next.toString());
      listeners.forEach((listener) => listener());
    },
  };
}

describe("useSearchParamOverlay", () => {
  it("is closed by default and opens by setting the param to the overlay id", () => {
    const { adapter } = createTestSearchParamAdapter();

    const { result } = renderHook(() =>
      useSearchParamOverlay("edit", { param: "dialog", adapter }),
    );

    expect(result.current.open).toBe(false);
    expect(result.current.data).toBeNull();

    act(() => {
      result.current.setOpen(true);
    });

    expect(result.current.open).toBe(true);
    expect(result.current.data).toEqual({});
  });

  it("reads open state when the param already matches the id", () => {
    const { adapter } = createTestSearchParamAdapter("dialog=edit");

    const { result } = renderHook(() =>
      useSearchParamOverlay("edit", { param: "dialog", adapter }),
    );

    expect(result.current.open).toBe(true);
  });

  it("removes the param when closing the active overlay", () => {
    const { adapter, getParams } = createTestSearchParamAdapter(
      "dialog=edit&dialog.userId=42",
    );

    const { result } = renderHook(() =>
      useSearchParamOverlay("edit", { param: "dialog", adapter }),
    );

    act(() => {
      result.current.setOpen(false);
    });

    expect(result.current.open).toBe(false);
    expect(result.current.data).toBeNull();
    expect(getParams().get("dialog")).toBeNull();
    expect(getParams().get("dialog.userId")).toBeNull();
  });

  it("does not remove the param when closing a different overlay id", () => {
    const { adapter, getParams } = createTestSearchParamAdapter(
      "dialog=settings&dialog.userId=9",
    );

    const { result } = renderHook(() =>
      useSearchParamOverlay("edit", { param: "dialog", adapter }),
    );

    act(() => {
      result.current.setOpen(false);
    });

    expect(result.current.open).toBe(false);
    expect(getParams().get("dialog")).toBe("settings");
    expect(getParams().get("dialog.userId")).toBe("9");
  });

  it("forwards replace to the adapter when opening", () => {
    const setSpy = vi.fn();
    const { adapter } = createTestSearchParamAdapter();

    const wrappedAdapter = createSearchParamAdapter({
      get: adapter.getSearchParams,
      set: (params, options) => {
        setSpy(options);
        adapter.setSearchParams(params, options);
      },
      subscribe: adapter.subscribe,
    });

    const { result } = renderHook(() =>
      useSearchParamOverlay("edit", {
        param: "dialog",
        replace: true,
        adapter: wrappedAdapter,
      }),
    );

    act(() => {
      result.current.onOpenChange(true);
    });

    expect(setSpy).toHaveBeenCalledWith({ replace: true });
    expect(result.current.open).toBe(true);
  });

  it("uses dialog and modal default param keys in wrapper hooks", () => {
    const { adapter: dialogAdapter, getParams: getDialogParams } =
      createTestSearchParamAdapter();
    const { adapter: modalAdapter, getParams: getModalParams } =
      createTestSearchParamAdapter();

    const dialog = renderHook(() =>
      useDialogSearchParam("edit-profile", { adapter: dialogAdapter }),
    );
    const modal = renderHook(() =>
      useModalSearchParam("bulk-import", { adapter: modalAdapter }),
    );

    act(() => {
      dialog.result.current.setOpen(true);
      modal.result.current.setOpen(true);
    });

    expect(getDialogParams().get("dialog")).toBe("edit-profile");
    expect(getModalParams().get("modal")).toBe("bulk-import");
  });

  it("reacts to external search param updates via adapter subscription", () => {
    const { adapter, setParams } = createTestSearchParamAdapter();

    const { result } = renderHook(() =>
      useSearchParamOverlay("edit", { param: "dialog", adapter }),
    );

    act(() => {
      setParams(new URLSearchParams("dialog=edit"));
    });

    expect(result.current.open).toBe(true);
  });

  it("writes flat data params when opening with openWith", () => {
    const { adapter, getParams } = createTestSearchParamAdapter();

    const { result } = renderHook(() =>
      useSearchParamOverlay<{ userId: string }>("edit-user", {
        param: "dialog",
        adapter,
      }),
    );

    act(() => {
      result.current.openWith({ userId: "42" });
    });

    expect(result.current.open).toBe(true);
    expect(result.current.data).toEqual({ userId: "42" });
    expect(getParams().get("dialog")).toBe("edit-user");
    expect(getParams().get("dialog.userId")).toBe("42");
  });

  it("round-trips data via setOpen with a state object", () => {
    const { adapter } = createTestSearchParamAdapter();

    const { result } = renderHook(() =>
      useSearchParamOverlay<{ tab: string; userId: string }>("edit-user", {
        param: "dialog",
        adapter,
      }),
    );

    act(() => {
      result.current.setOpen({
        id: "edit-user",
        data: { userId: "42", tab: "profile" },
      });
    });

    expect(result.current.data).toEqual({
      userId: "42",
      tab: "profile",
    });
  });

  it("ignores setOpen state when the id does not match the hook id", () => {
    const { adapter, getParams } = createTestSearchParamAdapter();

    const { result } = renderHook(() =>
      useSearchParamOverlay("edit-user", { param: "dialog", adapter }),
    );

    act(() => {
      result.current.setOpen({
        id: "other-user",
        data: { userId: "42" },
      });
    });

    expect(result.current.open).toBe(false);
    expect(getParams().get("dialog")).toBeNull();
  });

  it("supports object id input", () => {
    const { adapter } = createTestSearchParamAdapter("dialog=edit-user");

    const { result } = renderHook(() =>
      useDialogSearchParam({ id: "edit-user" }, { adapter }),
    );

    expect(result.current.open).toBe(true);
  });

  it("supports a custom data prefix", () => {
    const { adapter, getParams } = createTestSearchParamAdapter();

    const { result } = renderHook(() =>
      useSearchParamOverlay("edit-user", {
        param: "dialog",
        dataPrefix: "dlg.",
        adapter,
      }),
    );

    act(() => {
      result.current.openWith({ userId: "7" });
    });

    expect(getParams().get("dlg.userId")).toBe("7");
    expect(getParams().get("dialog.userId")).toBeNull();
  });
});
