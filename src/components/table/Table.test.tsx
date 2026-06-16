import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Table, TableHeader, TableContent, TableFooter, TableSearch, TableFilter, TablePagination } from "./Table";

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

    await user.click(screen.getByText("Filter"));

    expect(screen.getByText("Filter form")).toBeInTheDocument();
    expect(screen.getByText("Apply Filter")).toBeInTheDocument();
    expect(screen.getByText("clear")).toBeInTheDocument();

    await user.click(screen.getByText("Apply Filter"));
    expect(onApply).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText("Filter"));
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

    expect(screen.getByText("Page 3 of 10")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
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

  it("calls onPageChange when clicking next", async () => {
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
  });

  it("forwards className to root", () => {
    const { container } = render(
      <Table className="custom">Content</Table>,
    );
    expect(container.firstChild).toHaveClass("custom");
  });
});
