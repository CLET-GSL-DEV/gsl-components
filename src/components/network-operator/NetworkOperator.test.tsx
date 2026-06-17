import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NetworkOperator } from "./NetworkOperator";

describe("NetworkOperator", () => {
  it("renders the trigger button with placeholder", () => {
    render(<NetworkOperator placeholder="Pick operator" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Pick operator");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<NetworkOperator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies aria-invalid when invalid", () => {
    render(<NetworkOperator invalid />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the trigger", () => {
    render(<NetworkOperator disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("merges className on root", () => {
    const { container } = render(<NetworkOperator className="custom" />);
    const root = container.firstElementChild!;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("gsl-network-operator");
  });

  it("shows default value when uncontrolled with defaultValue", () => {
    render(<NetworkOperator defaultValue="mtn" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveTextContent("MTN");
  });

  it("selects an operator and fires onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NetworkOperator onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    const options = screen.getAllByRole("option");
    const vodafone = options.find((o) => o.textContent?.includes("Vodafone"))!;
    await user.click(vodafone);

    expect(onChange).toHaveBeenCalledWith("vodafone");
  });

  it("renders custom options", async () => {
    const user = userEvent.setup();
    const customOptions = [
      { value: "etisalat", label: "Etisalat" },
      { value: "orange", label: "Orange" },
    ];
    render(<NetworkOperator options={customOptions} />);

    await user.click(screen.getByRole("button"));
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Etisalat");
    expect(options[1]).toHaveTextContent("Orange");
  });

  // RHF integration
  it("works with react-hook-form", async () => {
    const user = userEvent.setup();

    function Form() {
      const form = useForm<{ operator: string | null }>({
        defaultValues: { operator: "mtn" },
      });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <NetworkOperator
            value={form.watch("operator") ?? undefined}
            onChange={(v) => form.setValue("operator", v)}
          />
          <span data-testid="value">{form.watch("operator")}</span>
        </form>
      );
    }

    render(<Form />);
    expect(screen.getByTestId("value")).toHaveTextContent("mtn");

    await user.click(screen.getByRole("button"));
    const options = screen.getAllByRole("option");
    const vodafone = options.find((o) => o.textContent?.includes("Vodafone"))!;
    await user.click(vodafone);

    expect(screen.getByTestId("value")).toHaveTextContent("vodafone");
  });
});
