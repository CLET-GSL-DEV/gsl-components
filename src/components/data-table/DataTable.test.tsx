import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./DataTable";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "department", label: "Department", sortable: true },
];

const data = [
  { name: "Ada Lovelace", department: "Engineering" },
  { name: "Grace Hopper", department: "Engineering" },
  { name: "Alan Turing", department: "Research" },
  { name: "Marie Curie", department: "Science" },
  { name: "Nikola Tesla", department: "Engineering" },
];

describe("DataTable", () => {
  it("renders columns and static rows", () => {
    render(<DataTable columns={columns} data={data} pageSize={10} />);

    expect(screen.getByRole("columnheader", { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Nikola Tesla" })).toBeInTheDocument();
  });

  it("does not render a search input", () => {
    render(<DataTable columns={columns} data={data} pageSize={10} />);

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("sorts static rows when a sortable header is clicked", async () => {
    const user = userEvent.setup();

    render(<DataTable columns={columns} data={data} pageSize={10} />);

    await user.click(screen.getByRole("button", { name: /Name/i }));

    const cells = screen.getAllByRole("cell", { name: /Lovelace|Hopper|Turing|Curie|Tesla/ });
    expect(cells[0]).toHaveTextContent("Ada Lovelace");
  });

  it("changes page size via pagination dropdown", async () => {
    const user = userEvent.setup();

    render(<DataTable columns={columns} data={data} pageSize={2} />);

    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Alan Turing" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await user.click(screen.getByRole("option", { name: "10" }));

    expect(screen.getByRole("cell", { name: "Alan Turing" })).toBeInTheDocument();
  });

  it("paginates static rows", async () => {
    const user = userEvent.setup();

    render(<DataTable columns={columns} data={data} pageSize={2} />);

    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Alan Turing" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("cell", { name: "Alan Turing" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Ada Lovelace" })).not.toBeInTheDocument();
  });

  it("shows spinner when loading prop is true", () => {
    render(<DataTable columns={columns} data={data} loading pageSize={10} />);

    expect(screen.getByRole("status", { name: "Loading data" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Ada Lovelace" })).not.toBeInTheDocument();
  });

  it("does not show empty state while loading", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        loading
        pageSize={10}
        emptyText="Nothing here"
      />,
    );

    expect(screen.getByRole("status", { name: "Loading data" })).toBeInTheDocument();
    expect(screen.queryByText("Nothing here")).not.toBeInTheDocument();
  });

  it("fires onRowClick when a row is clicked", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={data}
        pageSize={10}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByRole("cell", { name: "Grace Hopper" }));

    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Grace Hopper" }),
    );
  });

  it("shows empty state when there are no rows", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        pageSize={10}
        emptyText="Nothing here"
      />,
    );

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
