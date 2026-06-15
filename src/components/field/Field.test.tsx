import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "../input/Input";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "./Field";

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <Input type="email" />
        </FieldControl>
      </Field>,
    );

    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id");
  });

  it("wires aria-describedby for description and error", async () => {
    render(
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <Input type="email" />
        </FieldControl>
        <FieldDescription>We will never share your email.</FieldDescription>
        <FieldError>Email is required</FieldError>
      </Field>,
    );

    const input = screen.getByLabelText("Email");

    await waitFor(() => {
      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      expect(describedBy?.split(" ")).toHaveLength(2);
    });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("We will never share your email.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
  });

  it("does not render empty description or error", () => {
    render(
      <Field>
        <FieldLabel>Name</FieldLabel>
        <FieldControl>
          <Input />
        </FieldControl>
        <FieldDescription>{null}</FieldDescription>
        <FieldError>{undefined}</FieldError>
      </Field>,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
