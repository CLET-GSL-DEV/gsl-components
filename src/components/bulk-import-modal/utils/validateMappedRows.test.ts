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
