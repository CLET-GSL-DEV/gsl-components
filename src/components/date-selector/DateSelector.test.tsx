import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateSelector } from "./DateSelector";

describe("DateSelector", () => {
  it("renders a trigger button", () => {
    render(<DateSelector />);
    const trigger = screen.getByRole("button", { name: /select date/i });
    expect(trigger).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<DateSelector ref={ref as any} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies aria-invalid when invalid", () => {
    render(<DateSelector invalid />);
    const trigger = screen.getByRole("button", { name: /select date/i });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the trigger", () => {
    render(<DateSelector disabled />);
    const trigger = screen.getByRole("button", { name: /select date/i });
    expect(trigger).toBeDisabled();
  });

  it("merges className", () => {
    const { container } = render(<DateSelector className="custom" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("gsl-date-selector");
  });

  it("shows placeholder when no date is selected", () => {
    render(<DateSelector placeholder="Pick a day" />);
    expect(screen.getByText("Pick a day")).toBeInTheDocument();
  });

  it("shows selected date in the trigger", () => {
    const date = new Date(2026, 5, 15); // June 15, 2026
    render(<DateSelector value={date} />);
    expect(screen.getByText("Jun 15, 2026")).toBeInTheDocument();
  });

  it("opens calendar on trigger click", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);

    // Calendar should be visible
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("calls onChange when a day is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DateSelector onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);

    // Click the first available current-month day
    const days = screen.getAllByRole("gridcell");
    const enabledDay = days.find(
      (d) => !d.hasAttribute("disabled"),
    );
    expect(enabledDay).toBeDefined();

    await user.click(enabledDay!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it("closes calendar after date selection", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);
    expect(screen.getByRole("grid")).toBeInTheDocument();

    const days = screen.getAllByRole("gridcell");
    const enabledDay = days.find((d) => !d.hasAttribute("disabled"));
    await user.click(enabledDay!);

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<DateSelector disabled />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("navigates months with prev/next buttons", async () => {
    const user = userEvent.setup();
    render(<DateSelector />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);

    const currentMonth = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /next month/i });
    await user.click(nextBtn);

    // Title text should have changed
    expect(screen.queryByText(currentMonth)).not.toBeInTheDocument();
  });
});
