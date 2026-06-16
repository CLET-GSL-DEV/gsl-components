import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TableBuilder } from "./TableBuilder";

describe("TableBuilder", () => {
  it("renders header, content, and footer", () => {
    render(
      <TableBuilder>
        <TableBuilder.Header>Header</TableBuilder.Header>
        <TableBuilder.Content>Table content</TableBuilder.Content>
        <TableBuilder.Footer>Footer</TableBuilder.Footer>
      </TableBuilder>,
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Table content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders search and accepts input", async () => {
    const user = userEvent.setup();
    render(
      <TableBuilder>
        <TableBuilder.Header>
          <TableBuilder.Search />
        </TableBuilder.Header>
      </TableBuilder>,
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
      <TableBuilder>
        <TableBuilder.Header>
          <TableBuilder.Filter onApply={onApply} onReset={onReset}>
            <div>Filter form</div>
          </TableBuilder.Filter>
        </TableBuilder.Header>
      </TableBuilder>,
    );

    // Open the filter popover
    await user.click(screen.getByText("Filter"));

    // Should show filter content and buttons
    expect(screen.getByText("Filter form")).toBeInTheDocument();
    expect(screen.getByText("Apply Filter")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();

    // Click Apply
    await user.click(screen.getByText("Apply Filter"));
    expect(onApply).toHaveBeenCalledTimes(1);

    // Open again and click Reset
    await user.click(screen.getByText("Filter"));
    await user.click(screen.getByText("Reset"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders pagination controls", () => {
    const onPageChange = vi.fn();

    render(
      <TableBuilder>
        <TableBuilder.Footer>
          <TableBuilder.Pagination
            page={3}
            totalPages={10}
            onPageChange={onPageChange}
          />
        </TableBuilder.Footer>
      </TableBuilder>,
    );

    expect(screen.getByText("Page 3 of 10")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });

  it("disables prev/next at boundaries", () => {
    render(
      <TableBuilder>
        <TableBuilder.Footer>
          <TableBuilder.Pagination
            page={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        </TableBuilder.Footer>
      </TableBuilder>,
    );

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("calls onPageChange when clicking next", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <TableBuilder>
        <TableBuilder.Footer>
          <TableBuilder.Pagination
            page={2}
            totalPages={5}
            onPageChange={onPageChange}
          />
        </TableBuilder.Footer>
      </TableBuilder>,
    );

    await user.click(screen.getByLabelText("Previous page"));
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByLabelText("Next page"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("forwards className to root", () => {
    const { container } = render(
      <TableBuilder className="custom">Content</TableBuilder>,
    );
    expect(container.firstChild).toHaveClass("custom");
  });
});
