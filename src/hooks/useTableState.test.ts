import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createSearchParamAdapter } from "./createSearchParamAdapter";
import { useTableState } from "./useTableState";

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

describe("useTableState", () => {
  it("returns defaults when URL is empty", () => {
    const { adapter } = createTestAdapter();
    const { result } = renderHook(() => useTableState({ adapter }));

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.search).toBe("");
    expect(result.current.filters).toEqual({});
    expect(result.current.sort).toBeNull();
  });

  it("reads all values from URL params", () => {
    const { adapter } = createTestAdapter({
      page: "3",
      pageSize: "50",
      search: "hello",
      f_status: "active",
      f_role: "admin",
      sort: "name",
      direction: "asc",
    });
    const { result } = renderHook(() => useTableState({ adapter }));

    expect(result.current.page).toBe(3);
    expect(result.current.pageSize).toBe(50);
    expect(result.current.search).toBe("hello");
    expect(result.current.filters).toEqual({
      status: "active",
      role: "admin",
    });
    expect(result.current.sort).toEqual({
      column: "name",
      direction: "asc",
    });
  });

  it("setSearch writes to params and resets page", () => {
    const { adapter, getParams } = createTestAdapter();
    const { result } = renderHook(() => useTableState({ adapter }));

    act(() => {
      result.current.setPage(7);
    });
    act(() => {
      result.current.setSearch("test");
    });

    expect(result.current.search).toBe("test");
    expect(result.current.page).toBe(1);
    expect(getParams().get("search")).toBe("test");
    expect(getParams().get("page")).toBe("1");
  });

  it("setSearch clears param when empty", () => {
    const { adapter, getParams } = createTestAdapter({ search: "old" });
    const { result } = renderHook(() => useTableState({ adapter }));

    act(() => {
      result.current.setSearch("");
    });

    expect(result.current.search).toBe("");
    expect(getParams().has("search")).toBe(false);
  });

  it("setFilters writes multiple filter params", () => {
    const { adapter, getParams } = createTestAdapter();
    const { result } = renderHook(() => useTableState({ adapter }));

    act(() => {
      result.current.setFilters({ status: "active", role: "admin" });
    });

    expect(result.current.filters).toEqual({
      status: "active",
      role: "admin",
    });
    expect(getParams().get("f_status")).toBe("active");
    expect(getParams().get("f_role")).toBe("admin");
    expect(getParams().get("page")).toBe("1");
  });

  it("setFilters removes existing filters not in the new set", () => {
    const { adapter, getParams } = createTestAdapter({
      f_status: "active",
      f_role: "admin",
    });
    const { result } = renderHook(() => useTableState({ adapter }));

    act(() => {
      result.current.setFilters({ status: "inactive" });
    });

    expect(result.current.filters).toEqual({ status: "inactive" });
    expect(getParams().has("f_role")).toBe(false);
  });

  it("setFilter updates a single filter", () => {
    const { adapter } = createTestAdapter();
    const { result } = renderHook(() => useTableState({ adapter }));

    act(() => {
      result.current.setFilters({ status: "active", role: "admin" });
    });
    act(() => {
      result.current.setFilter("status", "pending");
    });

    expect(result.current.filters).toEqual({
      status: "pending",
      role: "admin",
    });
  });

  it("setFilter removes the key when value is empty string", () => {
    const { adapter, getParams } = createTestAdapter({
      f_status: "active",
      f_role: "admin",
    });
    const { result } = renderHook(() => useTableState({ adapter }));

    act(() => {
      result.current.setFilter("status", "" as unknown as string);
    });

    expect(result.current.filters).toEqual({ role: "admin" });
    expect(getParams().has("f_status")).toBe(false);
  });

  it("setSort writes column and direction to params", () => {
    const { adapter, getParams } = createTestAdapter();
    const { result } = renderHook(() => useTableState({ adapter }));

    act(() => {
      result.current.setSort({ column: "name", direction: "desc" });
    });

    expect(result.current.sort).toEqual({ column: "name", direction: "desc" });
    expect(getParams().get("sort")).toBe("name");
    expect(getParams().get("direction")).toBe("desc");
  });

  it("setSort null clears params", () => {
    const { adapter, getParams } = createTestAdapter({
      sort: "name",
      direction: "asc",
    });
    const { result } = renderHook(() => useTableState({ adapter }));

    act(() => {
      result.current.setSort(null);
    });

    expect(result.current.sort).toBeNull();
    expect(getParams().has("sort")).toBe(false);
  });

  it("resetAll clears all table params", () => {
    const { adapter, getParams } = createTestAdapter({
      page: "5",
      pageSize: "30",
      search: "query",
      f_status: "active",
      sort: "name",
      direction: "asc",
    });
    const { result } = renderHook(() => useTableState({ adapter }));

    act(() => {
      result.current.resetAll();
    });

    const params = getParams();
    expect(params.has("page")).toBe(false);
    expect(params.has("pageSize")).toBe(false);
    expect(params.has("search")).toBe(false);
    expect(params.has("f_status")).toBe(false);
    expect(params.has("sort")).toBe(false);
    expect(params.has("direction")).toBe(false);
  });

  it("respects paramPrefix for namespacing", () => {
    const { adapter } = createTestAdapter({
      "members.page": "3",
      "members.pageSize": "25",
      "members.search": "test",
      "members.f_role": "admin",
      "members.sort": "name",
      "members.direction": "desc",
    });
    const { result } = renderHook(() =>
      useTableState({ adapter, paramPrefix: "members" }),
    );

    expect(result.current.page).toBe(3);
    expect(result.current.pageSize).toBe(25);
    expect(result.current.search).toBe("test");
    expect(result.current.filters).toEqual({ role: "admin" });
    expect(result.current.sort).toEqual({ column: "name", direction: "desc" });
  });

  it("respects defaultFilters", () => {
    const { adapter } = createTestAdapter();
    const { result } = renderHook(() =>
      useTableState({ adapter, defaultFilters: { status: "active" } }),
    );

    expect(result.current.filters).toEqual({ status: "active" });
  });
});
