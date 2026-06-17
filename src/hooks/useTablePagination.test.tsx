import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { useTablePagination } from "./useTablePagination";

/**
 * Wraps children in MemoryRouter and captures the current location.search
 * into the provided ref after every render.
 */
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

describe("useTablePagination", () => {
  it("returns defaults when URL is empty", () => {
    const { result } = renderHookWithLocation(() => useTablePagination());

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it("reads initial values from URL params", () => {
    const { result } = renderHookWithLocation(
      () => useTablePagination(),
      ["/?page=3&pageSize=50"],
    );

    expect(result.current.page).toBe(3);
    expect(result.current.pageSize).toBe(50);
  });

  it("respects custom defaults", () => {
    const { result } = renderHookWithLocation(
      () => useTablePagination({ defaultPage: 5, defaultPageSize: 10 }),
    );

    expect(result.current.page).toBe(5);
    expect(result.current.pageSize).toBe(10);
  });

  it("setPage updates URL and state", () => {
    const { result, getSearchParams } = renderHookWithLocation(() =>
      useTablePagination(),
    );

    act(() => {
      result.current.setPage(4);
    });

    expect(result.current.page).toBe(4);
    expect(getSearchParams().get("page")).toBe("4");
  });

  it("setPageSize updates URL, resets page to default", () => {
    const { result, getSearchParams } = renderHookWithLocation(
      () => useTablePagination({ defaultPage: 1 }),
    );

    act(() => {
      result.current.setPage(5);
    });
    act(() => {
      result.current.setPageSize(50);
    });

    expect(result.current.pageSize).toBe(50);
    expect(result.current.page).toBe(1);
    expect(getSearchParams().get("pageSize")).toBe("50");
    expect(getSearchParams().get("page")).toBe("1");
  });

  it("reset removes page and pageSize from URL", () => {
    const { result, getSearchParams } = renderHookWithLocation(
      () => useTablePagination(),
      ["/?page=7&pageSize=30"],
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(getSearchParams().has("page")).toBe(false);
    expect(getSearchParams().has("pageSize")).toBe(false);
  });

  it("uses paramPrefix for namespaced keys", () => {
    const { result } = renderHookWithLocation(
      () => useTablePagination({ paramPrefix: "members" }),
      ["/?members.page=2&members.pageSize=25"],
    );

    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(25);
  });

  it("ignores unprefixed keys when prefix is set", () => {
    const { result } = renderHookWithLocation(
      () => useTablePagination({ paramPrefix: "members" }),
      ["/?page=99&members.page=3"],
    );

    expect(result.current.page).toBe(3);
  });
});
