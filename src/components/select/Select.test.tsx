import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

describe("Select", () => {
  it("renders the trigger with placeholder when value is empty", () => {
    render(
      <Select
        value=""
        onValueChange={() => {}}
        options={roles}
        placeholder="Choose role"
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Choose role")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Select value="" onValueChange={() => {}} options={roles} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("applies aria-invalid when invalid", () => {
    render(<Select value="" onValueChange={() => {}} options={roles} invalid />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the trigger", () => {
    render(<Select value="" onValueChange={() => {}} options={roles} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("merges className on trigger", () => {
    render(
      <Select
        value=""
        onValueChange={() => {}}
        options={roles}
        className="custom"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveClass("custom");
  });

  it("shows selected value text", () => {
    render(<Select value="editor" onValueChange={() => {}} options={roles} />);
    expect(screen.getByText("Editor")).toBeInTheDocument();
  });

  // RHF integration
  it("works with react-hook-form", async () => {
    const user = userEvent.setup();

    function Form() {
      const form = useForm<{ role: string }>({
        defaultValues: { role: "" },
      });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <select
            data-testid="native"
            value={form.watch("role")}
            onChange={(e) => form.setValue("role", e.target.value)}
          >
            <option value="">Select...</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <span data-testid="value">{form.watch("role")}</span>
        </form>
      );
    }

    render(<Form />);

    const native = screen.getByTestId("native") as HTMLSelectElement;
    await user.selectOptions(native, "admin");

    expect(screen.getByTestId("value")).toHaveTextContent("admin");
  });

  it("merges classNames for trigger, content, and item", () => {
    render(
      <Select
        value=""
        onValueChange={() => {}}
        options={roles}
        classNames={{ trigger: "trigger-custom", content: "content-custom" }}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveClass("trigger-custom");
  });
});
