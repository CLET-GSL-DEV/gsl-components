import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createSearchParamAdapter } from "./createSearchParamAdapter";
import { useTablePagination } from "./useTablePagination";

function createTestAdapter(initial: Record<string, string> = {}) {
  let params = new URLSearchParams(
    Object.entries(initial)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&"),
  );
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((fn) => fn());

  return {
    adapter: createSearchParamAdapter({
      get: () => params,
      set: (next) => {
        params = new URLSearchParams(next.toString());
        notify();
      },
      subscribe: (onStoreChange) => {
        listeners.add(onStoreChange);
        return () => listeners.delete(onStoreChange);
      },
    }),
    getParams: () => params,
  };
}

describe("useTablePagination", () => {
  it("returns defaults when URL is empty", () => {
    const { adapter } = createTestAdapter();
    const { result } = renderHook(() =>
      useTablePagination({ adapter }),
    );

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
  });

  it("reads initial values from URL params", () => {
    const { adapter } = createTestAdapter({ page: "3", pageSize: "50" });
    const { result } = renderHook(() =>
      useTablePagination({ adapter }),
    );

    expect(result.current.page).toBe(3);
    expect(result.current.pageSize).toBe(50);
  });

  it("respects custom defaults", () => {
    const { adapter } = createTestAdapter();
    const { result } = renderHook(() =>
      useTablePagination({ adapter, defaultPage: 5, defaultPageSize: 10 }),
    );

    expect(result.current.page).toBe(5);
    expect(result.current.pageSize).toBe(10);
  });

  it("setPage updates params and state", () => {
    const { adapter, getParams } = createTestAdapter();
    const { result } = renderHook(() =>
      useTablePagination({ adapter }),
    );

    act(() => {
      result.current.setPage(4);
    });

    expect(result.current.page).toBe(4);
    expect(getParams().get("page")).toBe("4");
  });

  it("setPageSize updates params, resets page to default", () => {
    const { adapter, getParams } = createTestAdapter();
    const { result } = renderHook(() =>
      useTablePagination({ adapter, defaultPage: 1 }),
    );

    act(() => {
      result.current.setPage(5);
    });
    act(() => {
      result.current.setPageSize(50);
    });

    expect(result.current.pageSize).toBe(50);
    expect(result.current.page).toBe(1);
    expect(getParams().get("pageSize")).toBe("50");
    expect(getParams().get("page")).toBe("1");
  });

  it("reset removes page and pageSize from params", () => {
    const { adapter, getParams } = createTestAdapter({
      page: "7",
      pageSize: "30",
    });
    const { result } = renderHook(() =>
      useTablePagination({ adapter }),
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
    expect(getParams().has("page")).toBe(false);
    expect(getParams().has("pageSize")).toBe(false);
  });

  it("uses paramPrefix for namespaced keys", () => {
    const { adapter } = createTestAdapter({
      "members.page": "2",
      "members.pageSize": "25",
    });
    const { result } = renderHook(() =>
      useTablePagination({ adapter, paramPrefix: "members" }),
    );

    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(25);
  });
});
