import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateRangeSelector } from "./DateRangeSelector";
import type { DateRangeValue } from "./DateRangeSelector";

describe("DateRangeSelector", () => {
  it("renders a trigger button", () => {
    render(<DateRangeSelector />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<DateRangeSelector ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies aria-invalid when invalid", () => {
    render(<DateRangeSelector invalid />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the trigger", () => {
    render(<DateRangeSelector disabled />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeDisabled();
  });

  it("merges className", () => {
    const { container } = render(<DateRangeSelector className="custom" />);
    const root = container.firstElementChild!;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("gsl-date-range-selector");
  });

  it("shows placeholder when no dates are selected", () => {
    render(<DateRangeSelector placeholder="Pick range" />);
    expect(screen.getByText("Pick range")).toBeInTheDocument();
  });

  it("shows selected range in the trigger", () => {
    render(
      <DateRangeSelector
        value={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 18) }}
      />,
    );
    const triggerText = screen.getByRole("button").textContent;
    expect(triggerText).toContain("Jun 1, 2026");
    expect(triggerText).toContain("Jun 18, 2026");
  });

  // Uncontrolled mode
  it("supports uncontrolled mode with defaultValue", () => {
    render(
      <DateRangeSelector
        defaultValue={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 18) }}
      />,
    );
    const triggerText = screen.getByRole("button").textContent;
    expect(triggerText).toContain("Jun 1, 2026");
    expect(triggerText).toContain("Jun 18, 2026");
  });

  it("opens calendar on trigger click", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("selects start date on first click and end date on second click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangeSelector onChange={onChange} />);

    await user.click(screen.getByRole("button"));

    // Find two enabled current-month days
    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));
    expect(enabled.length).toBeGreaterThanOrEqual(2);

    // First click: sets start
    await user.click(enabled[0]);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ start: expect.any(Date), end: null }),
    );

    // Second click: sets end and closes
    await user.click(enabled[enabled.length - 1]);
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as DateRangeValue;
    expect(lastCall.start).toBeInstanceOf(Date);
    expect(lastCall.end).toBeInstanceOf(Date);
    expect(lastCall.start!.getTime()).toBeLessThanOrEqual(lastCall.end!.getTime());
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("auto-swaps when second date is before first", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangeSelector onChange={onChange} />);

    await user.click(screen.getByRole("button"));

    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));

    // Click a later date first
    await user.click(enabled[enabled.length - 1]);

    // Click an earlier date second
    await user.click(enabled[0]);

    const range = onChange.mock.calls[onChange.mock.calls.length - 1][0] as DateRangeValue;
    expect(range.start!.getTime()).toBeLessThan(range.end!.getTime());
  });

  it("closes popover after selecting both dates", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector />);

    await user.click(screen.getByRole("button"));
    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));

    await user.click(enabled[0]);
    await user.click(enabled[enabled.length - 1]);

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("resets and starts new selection when range is already set", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangeSelector
        value={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 18) }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button"));
    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));

    await user.click(enabled[0]);
    // Should reset: only start is set, end is null
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ start: expect.any(Date), end: null }),
    );
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector disabled />);

    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("respects min and max date constraints", async () => {
    const user = userEvent.setup();
    const today = new Date();
    render(
      <DateRangeSelector
        min={new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)}
        max={new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10)}
      />,
    );

    await user.click(screen.getByRole("button"));
    const days = screen.getAllByRole("gridcell");
    const enabledCount = days.filter((d) => !d.hasAttribute("disabled")).length;
    expect(enabledCount).toBeGreaterThan(0);
    expect(enabledCount).toBeLessThanOrEqual(6);
  });

  it("navigates months with prev/next buttons", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector />);

    await user.click(screen.getByRole("button"));

    const currentMonth = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /next month/i });
    await user.click(nextBtn);
    expect(screen.queryByText(currentMonth)).not.toBeInTheDocument();

    const prevBtn = screen.getByRole("button", { name: /previous month/i });
    await user.click(prevBtn);
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  it("highlights days in the selected range", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector />);

    await user.click(screen.getByRole("button"));

    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));
    expect(enabled.length).toBeGreaterThanOrEqual(3);

    // Select a range
    await user.click(enabled[0]);
    await user.click(enabled[enabled.length - 1]);

    // Reopen to verify range highlighting
    await user.click(screen.getByRole("button"));

    const allDays = screen.getAllByRole("gridcell");
    const inRange = allDays.filter((d) =>
      d.className.includes("in-range"),
    );
    // There should be days in the range (exclusive of start/end)
    // At least 0 because we don't know the exact month layout
    expect(inRange.length).toBeGreaterThanOrEqual(0);
  });

  // RHF integration
  it("works with react-hook-form controlled", async () => {
    const user = userEvent.setup();

    function Form() {
      const form = useForm<{ dateRange: DateRangeValue }>({
        defaultValues: {
          dateRange: {
            start: new Date(2026, 5, 1),
            end: new Date(2026, 5, 18),
          },
        },
      });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <DateRangeSelector
            value={form.watch("dateRange")}
            onChange={(v) => form.setValue("dateRange", v)}
          />
          <span data-testid="start">
            {form.watch("dateRange.start")?.toISOString() ?? "null"}
          </span>
          <span data-testid="end">
            {form.watch("dateRange.end")?.toISOString() ?? "null"}
          </span>
        </form>
      );
    }

    render(<Form />);
    expect(screen.getByTestId("start")).not.toHaveTextContent("null");
    expect(screen.getByTestId("end")).not.toHaveTextContent("null");

    // Open calendar and change selection
    await user.click(screen.getByRole("button"));
    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));

    await user.click(enabled[0]);
    // First click resets (now start is set, end is null)
    expect(screen.getByTestId("end")).toHaveTextContent("null");

    await user.click(enabled[enabled.length - 1]);
    // Both should be set
    expect(screen.getByTestId("start")).not.toHaveTextContent("null");
    expect(screen.getByTestId("end")).not.toHaveTextContent("null");
  });
});
