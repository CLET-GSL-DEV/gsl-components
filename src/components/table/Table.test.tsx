import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Table, TableContent, TableFooter } from "./Table";
import { TableHeader, TableSearch, TableFilter } from "./TableHeader";
import { TablePagination } from "./TablePagination";

describe("Table", () => {
  it("renders header, content, and footer", () => {
    render(
      <Table>
        <TableHeader>Header</TableHeader>
        <TableContent>Table content</TableContent>
        <TableFooter>Footer</TableFooter>
      </Table>,
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Table content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders search and accepts input", async () => {
    const user = userEvent.setup();
    render(
      <Table>
        <TableHeader>
          <TableSearch />
        </TableHeader>
      </Table>,
    );

    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "hello");
    expect(input).toHaveValue("hello");
  });

  it("renders filter popover with apply and reset", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const onReset = vi.fn();

    render(
      <Table>
        <TableHeader>
          <TableFilter onApply={onApply} onReset={onReset}>
            <div>Filter form</div>
          </TableFilter>
        </TableHeader>
      </Table>,
    );

    await user.click(screen.getByLabelText("Filter"));

    expect(screen.getByText("Filter form")).toBeInTheDocument();
    expect(screen.getByText("Apply Filter")).toBeInTheDocument();
    expect(screen.getByText("clear")).toBeInTheDocument();

    await user.click(screen.getByText("Apply Filter"));
    expect(onApply).toHaveBeenCalledTimes(1);

    await user.click(screen.getByLabelText("Filter"));
    await user.click(screen.getByText("clear"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders pagination controls", () => {
    const onPageChange = vi.fn();

    render(
      <Table>
        <TableFooter>
          <TablePagination
            page={3}
            totalPages={10}
            onPageChange={onPageChange}
          />
        </TableFooter>
      </Table>,
    );

    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    // current page button has aria-current="page"
    const currentBtn = screen.getByRole("button", { name: "3" });
    expect(currentBtn).toHaveAttribute("aria-current", "page");
    // non-current page buttons exist
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });

  it("disables prev/next at boundaries", () => {
    render(
      <Table>
        <TableFooter>
          <TablePagination
            page={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        </TableFooter>
      </Table>,
    );

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("calls onPageChange when clicking prev, next, or a page number", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Table>
        <TableFooter>
          <TablePagination
            page={2}
            totalPages={5}
            onPageChange={onPageChange}
          />
        </TableFooter>
      </Table>,
    );

    await user.click(screen.getByLabelText("Previous page"));
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByLabelText("Next page"));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByText("5"));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it("forwards className to root", () => {
    const { container } = render(
      <Table className="custom">Content</Table>,
    );
    expect(container.firstChild).toHaveClass("custom");
  });
});
