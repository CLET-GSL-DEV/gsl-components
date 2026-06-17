import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
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
      <MemoryRouter>
        <Table>
          <TableHeader>
            <TableSearch />
          </TableHeader>
        </Table>
      </MemoryRouter>,
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
      <MemoryRouter>
        <Table>
          <TableHeader>
            <TableFilter onApply={onApply} onReset={onReset}>
              <div>Filter form</div>
            </TableFilter>
          </TableHeader>
        </Table>
      </MemoryRouter>,
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
    render(
      <MemoryRouter initialEntries={["/?page=3&pageSize=10"]}>
        <Table>
          <TableFooter>
            <TablePagination totalPages={10} />
          </TableFooter>
        </Table>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    const currentBtn = screen.getByRole("button", { name: "3" });
    expect(currentBtn).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });

  it("disables prev/next at boundaries", () => {
    render(
      <MemoryRouter initialEntries={["/?page=1"]}>
        <Table>
          <TableFooter>
            <TablePagination totalPages={1} />
          </TableFooter>
        </Table>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("clicking page numbers updates URL", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/?page=2"]}>
        <Table>
          <TableFooter>
            <TablePagination totalPages={5} />
          </TableFooter>
        </Table>
      </MemoryRouter>,
    );

    await user.click(screen.getByText("1"));
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByText("5"));
    expect(screen.getByRole("button", { name: "5" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByLabelText("Next page"));
    expect(screen.getByRole("button", { name: "5" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByLabelText("Previous page"));
    expect(screen.getByRole("button", { name: "4" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("forwards className to root", () => {
    const { container } = render(
      <Table className="custom">Content</Table>,
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("renders skeleton rows when loading", () => {
    const { container } = render(
      <Table>
        <TableContent
          loading
          loadingRows={3}
          columns={[
            { id: "name", header: "Name" },
            { id: "email", header: "Email" },
          ]}
          data={[]}
          rowKey={(row: { id: number }) => row.id}
        />
      </Table>,
    );

    // Header labels still render
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    // Skeleton cells render (3 rows × 2 columns = 6 skeleton td)
    const skeletons = container.querySelectorAll(".gsl-table__skeleton--td");
    expect(skeletons.length).toBe(6);
    // No empty state text
    expect(screen.queryByText("No data")).not.toBeInTheDocument();
  });

  it("loading takes priority over no data", () => {
    render(
      <Table>
        <TableContent loading columns={[]} data={[]} />
      </Table>,
    );

    expect(screen.queryByText("No data")).not.toBeInTheDocument();
  });
});
