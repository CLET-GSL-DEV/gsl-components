import { describe, expect, it } from "vitest";
import { getFieldHint, validateFieldValue } from "./validateFieldValue";

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
            value.endsWith("@gsl.edu.gh") ? null : "Must use a GSL email",
        },
        "a@example.com",
      ),
    ).toBe("Must use a GSL email");
  });
});

describe("getFieldHint", () => {
  it("prefers description and example when provided", () => {
    expect(
      getFieldHint({
        key: "email",
        label: "Email",
        description: "Work email address",
        example: "student@gsl.edu.gh",
      }),
    ).toBe("Work email address Example: student@gsl.edu.gh");
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
