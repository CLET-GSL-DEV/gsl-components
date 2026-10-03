import { describe, expect, it } from "vitest";
import { validateMappedRows } from "./validateMappedRows";

const fields = [
  {
    key: "email",
    label: "Email",
    required: true,
    type: "email" as const,
  },
  { key: "full_name", label: "Full name", required: true },
];

describe("validateMappedRows", () => {
  it("reports missing required values and schema validator failures", () => {
    const issues = validateMappedRows(
      [
        { email: "", full_name: "Ada Lovelace" },
        { email: "invalid", full_name: "Grace Hopper" },
      ],
      fields,
    );

    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatchObject({
      row: 1,
      fieldKey: "email",
      message: "Required field is empty",
    });
    expect(issues[1]).toMatchObject({
      row: 2,
      fieldKey: "email",
      message: "Must be a valid email address",
    });
  });
});

describe("file fields", () => {
  const fileFields = [
    { key: "name", label: "Name" },
    { key: "photo", label: "Photo", type: "file" as const, required: true },
    { key: "cv", label: "CV", type: "file" as const },
  ];
  const rows = [{ name: "Ama" }, { name: "Kofi" }];
  const photo = new File(["x"], "photo.png", { type: "image/png" });

  it("errors when a required file is missing", () => {
    const issues = validateMappedRows(rows, fileFields, undefined, { 0: { photo } });

    expect(issues).toEqual([
      {
        row: 2,
        fieldKey: "photo",
        fieldLabel: "Photo",
        message: "File is required",
        severity: "error",
      },
    ]);
  });

  it("passes when every required file is present", () => {
    expect(
      validateMappedRows(rows, fileFields, undefined, { 0: { photo }, 1: { photo } }),
    ).toEqual([]);
  });

  it("ignores a missing optional file", () => {
    const issues = validateMappedRows(rows, fileFields, undefined, { 0: { photo }, 1: { photo } });

    expect(issues.some((issue) => issue.fieldKey === "cv")).toBe(false);
  });
});
