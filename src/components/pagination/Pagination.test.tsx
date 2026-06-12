import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("renders summary text", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={42}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Showing 1–10 of 42")).toBeInTheDocument();
  });

  it("changes page via next and previous", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={2}
        pageSize={10}
        total={42}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("changes page size via dropdown", async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();

    render(
      <Pagination
        page={1}
        pageSize={10}
        total={42}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await user.click(screen.getByRole("option", { name: "25" }));

    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it("disables controls when loading", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={42}
        loading
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Rows per page" })).toBeDisabled();
  });
});
