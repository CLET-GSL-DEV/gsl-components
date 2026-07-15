import { describe, expect, it } from "vitest";
import {
  getFieldExampleValue,
  getFieldHint,
  validateFieldValue,
} from "./validateFieldValue";

describe("validateFieldValue", () => {
  it("validates required fields", () => {
    expect(
      validateFieldValue({ key: "name", label: "Name", required: true }, "  "),
    ).toBe("Required field is empty");
  });

  it("validates email type", () => {
    expect(
      validateFieldValue(
        { key: "email", label: "Email", type: "email" },
        "invalid",
      ),
    ).toBe("Must be a valid email address");
    expect(
      validateFieldValue(
        { key: "email", label: "Email", type: "email" },
        "a@example.com",
      ),
    ).toBeNull();
  });

  it("validates regex pattern with custom message", () => {
    expect(
      validateFieldValue(
        {
          key: "student_id",
          label: "Student ID",
          pattern: "^STU-\\d{4}$",
          patternMessage: "Use format STU-1234",
        },
        "ABC",
      ),
    ).toBe("Use format STU-1234");
  });

  it("validates length, numeric range, and options", () => {
    expect(
      validateFieldValue(
        {
          key: "age",
          label: "Age",
          type: "integer",
          min: 18,
          max: 100,
        },
        "16",
      ),
    ).toBe("Must be at least 18");

    expect(
      validateFieldValue(
        {
          key: "status",
          label: "Status",
          options: ["active", "inactive"],
        },
        "pending",
      ),
    ).toBe("Must be one of: active, inactive");

    expect(
      validateFieldValue(
        {
          key: "code",
          label: "Code",
          minLength: 3,
          maxLength: 6,
        },
        "ab",
      ),
    ).toBe("Must be at least 3 characters");
  });

  it("runs custom validate after schema rules", () => {
    expect(
      validateFieldValue(
        {
          key: "email",
          label: "Email",
          type: "email",
          validate: (value) =>
            value.endsWith("@clet.edu.gh") ? null : "Must use a CLET email",
        },
        "a@example.com",
      ),
    ).toBe("Must use a CLET email");
  });
});

describe("getFieldExampleValue", () => {
  it("prefers explicit example over schema defaults", () => {
    expect(
      getFieldExampleValue({
        key: "status",
        label: "Status",
        example: "pending",
        options: ["active", "inactive"],
        type: "integer",
        min: 18,
      }),
    ).toBe("pending");
  });

  it("uses the first option when example is omitted", () => {
    expect(
      getFieldExampleValue({
        key: "status",
        label: "Status",
        options: ["active", "inactive"],
      }),
    ).toBe("active");
  });

  it("uses min for numeric types", () => {
    expect(
      getFieldExampleValue({
        key: "age",
        label: "Age",
        type: "integer",
        min: 18,
      }),
    ).toBe("18");
  });

  it("extracts a sample from patternMessage format hints", () => {
    expect(
      getFieldExampleValue({
        key: "student_id",
        label: "Student ID",
        pattern: "^STU-\\d{4}$",
        patternMessage: "Use format STU-1234",
      }),
    ).toBe("STU-1234");
  });

  it("falls back to an em dash for bare string fields", () => {
    expect(
      getFieldExampleValue({
        key: "name",
        label: "Name",
      }),
    ).toBe("—");
  });
});

describe("getFieldHint", () => {
  it("prefers description and example when provided", () => {
    expect(
      getFieldHint({
        key: "email",
        label: "Email",
        description: "Work email address",
        example: "student@clet.edu.gh",
      }),
    ).toBe("Work email address Example: student@clet.edu.gh");
  });

  it("builds hints from schema rules", () => {
    expect(
      getFieldHint({
        key: "student_id",
        label: "Student ID",
        type: "string",
        pattern: "^STU-\\d{4}$",
        options: ["active", "inactive"],
      }),
    ).toContain("Pattern: ^STU-\\d{4}$");
  });
});
