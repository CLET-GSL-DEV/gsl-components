import { describe, expect, it } from "vitest";
import { paginateRows, sortRows } from "./dataTableClient";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "department", label: "Department", sortable: true },
];

const rows = [
  { name: "Ada Lovelace", department: "Engineering" },
  { name: "Grace Hopper", department: "Engineering" },
  { name: "Alan Turing", department: "Research" },
];

describe("dataTableClient", () => {
  it("sorts rows ascending and descending", () => {
    const ascending = sortRows(rows, { key: "name", direction: "asc" }, columns);
    expect(ascending.map((row) => row.name)).toEqual([
      "Ada Lovelace",
      "Alan Turing",
      "Grace Hopper",
    ]);

    const descending = sortRows(
      rows,
      { key: "name", direction: "desc" },
      columns,
    );
    expect(descending.map((row) => row.name)).toEqual([
      "Grace Hopper",
      "Alan Turing",
      "Ada Lovelace",
    ]);
  });

  it("paginates rows", () => {
    expect(paginateRows(rows, 1, 2)).toHaveLength(2);
    expect(paginateRows(rows, 2, 2)).toEqual([
      { name: "Alan Turing", department: "Research" },
    ]);
  });
});
