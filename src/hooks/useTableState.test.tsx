import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { useTableState } from "./useTableState";

function LocationCapture({
  children,
  searchRef,
}: {
  children: React.ReactNode;
  searchRef: React.MutableRefObject<string>;
}) {
  const location = useLocation();
  searchRef.current = location.search;
  return <>{children}</>;
}

function renderHookWithLocation<TResult>(
  hook: () => TResult,
  initialEntries: string[] = ["/"],
) {
  const searchRef: React.MutableRefObject<string> = { current: "" };

  const utils = renderHook(hook, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>
        <LocationCapture searchRef={searchRef}>
          {children}
        </LocationCapture>
      </MemoryRouter>
    ),
  });

  return {
    ...utils,
    getSearchParams: () => new URLSearchParams(searchRef.current),
  };
}

describe("useTableState", () => {
  it("returns defaults when URL is empty", () => {
    const { result } = renderHookWithLocation(() => useTableState());

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.search).toBe("");
    expect(result.current.filters).toEqual({});
    expect(result.current.sort).toBeNull();
  });

  it("reads all values from URL params", () => {
    const { result } = renderHookWithLocation(
      () => useTableState(),
      [
        "/?page=3&pageSize=50&search=hello&f_status=active&f_role=admin&sort=name&direction=asc",
      ],
    );

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

  it("setSearch writes to URL and resets page", () => {
    const { result, getSearchParams } = renderHookWithLocation(() =>
      useTableState(),
    );

    act(() => {
      result.current.setPage(7);
    });
    act(() => {
      result.current.setSearch("test");
    });

    expect(result.current.search).toBe("test");
    expect(result.current.page).toBe(1);
    expect(getSearchParams().get("search")).toBe("test");
    expect(getSearchParams().get("page")).toBe("1");
  });

  it("setSearch clears param when empty", () => {
    const { result, getSearchParams } = renderHookWithLocation(
      () => useTableState(),
      ["/?search=old"],
    );

    act(() => {
      result.current.setSearch("");
    });

    expect(result.current.search).toBe("");
    expect(getSearchParams().has("search")).toBe(false);
  });

  it("setFilters writes multiple filter params", () => {
    const { result, getSearchParams } = renderHookWithLocation(() =>
      useTableState(),
    );

    act(() => {
      result.current.setFilters({ status: "active", role: "admin" });
    });

    expect(result.current.filters).toEqual({
      status: "active",
      role: "admin",
    });
    expect(getSearchParams().get("f_status")).toBe("active");
    expect(getSearchParams().get("f_role")).toBe("admin");
    expect(getSearchParams().get("page")).toBe("1");
  });

  it("setFilters removes existing filters not in the new set", () => {
    const { result, getSearchParams } = renderHookWithLocation(
      () => useTableState(),
      ["/?f_status=active&f_role=admin"],
    );

    act(() => {
      result.current.setFilters({ status: "inactive" });
    });

    expect(result.current.filters).toEqual({ status: "inactive" });
    expect(getSearchParams().has("f_role")).toBe(false);
  });

  it("setFilter updates a single filter", () => {
    const { result } = renderHookWithLocation(() => useTableState());

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
    const { result, getSearchParams } = renderHookWithLocation(
      () => useTableState(),
      ["/?f_status=active&f_role=admin"],
    );

    act(() => {
      result.current.setFilter("status", "" as unknown as string);
    });

    expect(result.current.filters).toEqual({ role: "admin" });
    expect(getSearchParams().has("f_status")).toBe(false);
  });

  it("setSort writes column and direction to URL", () => {
    const { result, getSearchParams } = renderHookWithLocation(() =>
      useTableState(),
    );

    act(() => {
      result.current.setSort({ column: "name", direction: "desc" });
    });

    expect(result.current.sort).toEqual({ column: "name", direction: "desc" });
    expect(getSearchParams().get("sort")).toBe("name");
    expect(getSearchParams().get("direction")).toBe("desc");
  });

  it("setSort null clears params", () => {
    const { result, getSearchParams } = renderHookWithLocation(
      () => useTableState(),
      ["/?sort=name&direction=asc"],
    );

    act(() => {
      result.current.setSort(null);
    });

    expect(result.current.sort).toBeNull();
    expect(getSearchParams().has("sort")).toBe(false);
  });

  it("resetAll clears all table params", () => {
    const { result, getSearchParams } = renderHookWithLocation(
      () => useTableState(),
      [
        "/?page=5&pageSize=30&search=query&f_status=active&sort=name&direction=asc",
      ],
    );

    act(() => {
      result.current.resetAll();
    });

    const params = getSearchParams();
    expect(params.has("page")).toBe(false);
    expect(params.has("pageSize")).toBe(false);
    expect(params.has("search")).toBe(false);
    expect(params.has("f_status")).toBe(false);
    expect(params.has("sort")).toBe(false);
    expect(params.has("direction")).toBe(false);
  });

  it("respects paramPrefix for namespacing", () => {
    const { result } = renderHookWithLocation(
      () => useTableState({ paramPrefix: "members" }),
      [
        "/?members.page=3&members.pageSize=25&members.search=test&members.f_role=admin&members.sort=name&members.direction=desc",
      ],
    );

    expect(result.current.page).toBe(3);
    expect(result.current.pageSize).toBe(25);
    expect(result.current.search).toBe("test");
    expect(result.current.filters).toEqual({ role: "admin" });
    expect(result.current.sort).toEqual({ column: "name", direction: "desc" });
  });

  it("respects defaultFilters", () => {
    const { result } = renderHookWithLocation(
      () => useTableState({ defaultFilters: { status: "active" } }),
    );

    expect(result.current.filters).toEqual({ status: "active" });
  });

  it("pagination setters still work via composition", () => {
    const { result, getSearchParams } = renderHookWithLocation(() =>
      useTableState(),
    );

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.page).toBe(3);
    expect(getSearchParams().get("page")).toBe("3");
  });
});
