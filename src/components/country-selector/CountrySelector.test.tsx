import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CountrySelector } from "./CountrySelector";

describe("CountrySelector", () => {
  it("renders with default country (Ghana)", () => {
    render(<CountrySelector />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Ghana")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CountrySelector ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies aria-invalid when invalid", () => {
    render(<CountrySelector invalid />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the trigger", () => {
    render(<CountrySelector disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("merges className on root", () => {
    const { container } = render(<CountrySelector className="custom" />);
    const root = container.firstElementChild!;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("gsl-country-selector");
  });

  it("opens popover and selects a country", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CountrySelector value="GH" onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    const options = screen.getAllByRole("option");
    const nigeria = options.find((o) => o.textContent?.includes("Nigeria"));
    expect(nigeria).toBeInTheDocument();

    await user.click(nigeria!);
    expect(onChange).toHaveBeenCalledWith("NG");
  });

  it("filters countries by search", async () => {
    const user = userEvent.setup();
    render(<CountrySelector />);

    await user.click(screen.getByRole("button"));
    const searchInput = screen.getByPlaceholderText("Search country...");
    await user.type(searchInput, "France");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("France");
  });

  it("shows placeholder when selected country is invalid", () => {
    render(<CountrySelector value="XX" placeholder="Pick one" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveTextContent("Pick one");
  });

  // RHF integration
  it("works with react-hook-form controlled", async () => {
    const user = userEvent.setup();

    function Form() {
      const form = useForm<{ country: string }>({
        defaultValues: { country: "GH" },
      });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <CountrySelector
            value={form.watch("country")}
            onChange={(v) => form.setValue("country", v ?? "")}
          />
          <span data-testid="value">{form.watch("country")}</span>
        </form>
      );
    }

    render(<Form />);
    expect(screen.getByTestId("value")).toHaveTextContent("GH");

    await user.click(screen.getByRole("button"));
    const options = screen.getAllByRole("option");
    const nigeria = options.find((o) => o.textContent?.includes("Nigeria"))!;
    await user.click(nigeria);

    expect(screen.getByTestId("value")).toHaveTextContent("NG");
  });
});
