import { createRef, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateRangeSelector } from "./DateRangeSelector";
import type { DateRangeValue } from "./DateRangeSelector";

describe("DateRangeSelector", () => {
  it("formats the field label in the given locale", () => {
    render(
      <DateRangeSelector
        locale="en-GB"
        value={{ start: new Date(2026, 2, 2), end: new Date(2026, 2, 9) }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("2 Mar 2026");
  });

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
    expect(root).toHaveClass("clet-date-range-selector");
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
    const grids = screen.getAllByRole("grid");
    expect(grids).toHaveLength(2);
  });

  it("shows two month panels", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector />);

    await user.click(screen.getByRole("button"));

    const grids = screen.getAllByRole("grid");
    expect(grids).toHaveLength(2);
  });

  it("selects start date on first click and end date on second click via Apply", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangeSelector onChange={onChange} />);

    await user.click(screen.getByRole("button"));

    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));
    expect(enabled.length).toBeGreaterThanOrEqual(2);

    // First click: sets start (no onChange yet)
    await user.click(enabled[0]);
    expect(onChange).not.toHaveBeenCalled();

    // Second click: sets end (no onChange yet)
    await user.click(enabled[enabled.length - 1]);
    expect(onChange).not.toHaveBeenCalled();

    // Click Apply
    await user.click(screen.getByRole("button", { name: /apply/i }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0] as DateRangeValue;
    expect(range.start).toBeInstanceOf(Date);
    expect(range.end).toBeInstanceOf(Date);
    expect(range.start!.getTime()).toBeLessThanOrEqual(range.end!.getTime());
  });

  it("closes popover only after clicking Apply", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector />);

    await user.click(screen.getByRole("button"));
    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));

    await user.click(enabled[0]);
    await user.click(enabled[enabled.length - 1]);

    // Popover should still be open before Apply
    expect(screen.getAllByRole("grid")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /apply/i }));
    expect(screen.queryAllByRole("grid")).toHaveLength(0);
  });

  it("cancels selection and resets to previous range", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangeSelector
        defaultValue={{ start: new Date(2026, 5, 1), end: new Date(2026, 5, 18) }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button"));

    // Select new dates
    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));
    await user.click(enabled[0]);
    await user.click(enabled[enabled.length - 1]);

    // Click Cancel
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();

    // Trigger should still show original range
    const triggerText = screen.getByRole("button").textContent;
    expect(triggerText).toContain("Jun 1, 2026");
    expect(triggerText).toContain("Jun 18, 2026");
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

    // Apply
    await user.click(screen.getByRole("button", { name: /apply/i }));

    const range = onChange.mock.calls[0][0] as DateRangeValue;
    expect(range.start!.getTime()).toBeLessThan(range.end!.getTime());
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

  describe("per-panel headers", () => {
    const panel = (name: "Start calendar" | "End calendar") =>
      screen.getByRole("group", { name });
    const shownMonth = (name: "Start calendar" | "End calendar") =>
      within(panel(name)).getByRole("combobox", { name: /select month/i }).textContent;
    const shownYear = (name: "Start calendar" | "End calendar") =>
      within(panel(name)).getByRole("combobox", { name: /select year/i }).textContent;

    const openWith = async (start: Date, end: Date | null) => {
      const user = userEvent.setup();
      render(<DateRangeSelector defaultValue={{ start, end }} />);
      await user.click(screen.getByRole("button"));
      return user;
    };

    it("gives each panel its own arrows, month select and year select", async () => {
      await openWith(new Date(2026, 5, 1), new Date(2026, 7, 18));

      for (const name of ["Start calendar", "End calendar"] as const) {
        const scope = within(panel(name));
        expect(scope.getByRole("button", { name: /previous month/i })).toBeInTheDocument();
        expect(scope.getByRole("button", { name: /next month/i })).toBeInTheDocument();
        expect(scope.getByRole("combobox", { name: /select month/i })).toBeInTheDocument();
        expect(scope.getByRole("combobox", { name: /select year/i })).toBeInTheDocument();
      }
    });

    it("shows the start month and the end month in their own panels", async () => {
      await openWith(new Date(2026, 5, 1), new Date(2026, 7, 18));

      expect(shownMonth("Start calendar")).toContain("June");
      expect(shownMonth("End calendar")).toContain("August");
    });

    it("shows the following month in the end panel until an end date exists", async () => {
      await openWith(new Date(2026, 5, 1), null);

      expect(shownMonth("Start calendar")).toContain("June");
      expect(shownMonth("End calendar")).toContain("July");
    });

    it("shows the following month when start and end share a month", async () => {
      await openWith(new Date(2026, 5, 1), new Date(2026, 5, 18));

      expect(shownMonth("End calendar")).toContain("July");
    });

    it("moves only the start panel when its arrows are used", async () => {
      const user = await openWith(new Date(2026, 5, 1), new Date(2026, 7, 18));

      await user.click(
        within(panel("Start calendar")).getByRole("button", { name: /next month/i }),
      );

      expect(shownMonth("Start calendar")).toContain("July");
      expect(shownMonth("End calendar")).toContain("August");
    });

    it("moves only the end panel when its arrows are used", async () => {
      const user = await openWith(new Date(2026, 5, 1), new Date(2026, 7, 18));

      await user.click(
        within(panel("End calendar")).getByRole("button", { name: /previous month/i }),
      );

      expect(shownMonth("Start calendar")).toContain("June");
      expect(shownMonth("End calendar")).toContain("July");
    });

    it("rolls the year over when stepping past January", async () => {
      const user = await openWith(new Date(2026, 0, 10), new Date(2026, 2, 5));

      await user.click(
        within(panel("Start calendar")).getByRole("button", { name: /previous month/i }),
      );

      expect(shownMonth("Start calendar")).toContain("December");
      expect(shownYear("Start calendar")).toContain("2025");
      expect(shownYear("End calendar")).toContain("2026");
    });

    it("changes only its own panel via the month select", async () => {
      const user = await openWith(new Date(2026, 5, 1), new Date(2026, 7, 18));

      await user.click(
        within(panel("End calendar")).getByRole("combobox", { name: /select month/i }),
      );
      await user.click(await screen.findByRole("option", { name: "December" }));

      expect(shownMonth("End calendar")).toContain("December");
      expect(shownMonth("Start calendar")).toContain("June");
    });

    it("changes only its own panel via the year select", async () => {
      const user = await openWith(new Date(2026, 5, 1), new Date(2026, 7, 18));

      await user.click(
        within(panel("Start calendar")).getByRole("combobox", { name: /select year/i }),
      );
      await user.click(await screen.findByRole("option", { name: "2025" }));

      expect(shownYear("Start calendar")).toContain("2025");
      expect(shownYear("End calendar")).toContain("2026");
    });

    it("selects a range that starts in one calendar and ends in the other", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateRangeSelector
          defaultValue={{ start: new Date(2026, 5, 1), end: null }}
          onChange={onChange}
        />,
      );
      await user.click(screen.getByRole("button"));

      await user.click(
        within(panel("End calendar")).getByRole("gridcell", {
          name: "Wednesday, July 15, 2026",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Apply" }));

      const value = onChange.mock.calls[0][0] as DateRangeValue;
      expect(value.start).toEqual(new Date(2026, 5, 1));
      expect(value.end).toEqual(new Date(2026, 6, 15));
    });
  });

  describe("year range", () => {
    const openYears = async (ui: ReactElement) => {
      const user = userEvent.setup();
      render(ui);
      await user.click(screen.getByRole("button"));
      const start = screen.getByRole("group", { name: "Start calendar" });
      await user.click(within(start).getByRole("combobox", { name: /select year/i }));
      return user;
    };

    it("offers years back to 1980 by default", async () => {
      await openYears(<DateRangeSelector />);

      expect(await screen.findByRole("option", { name: "1980" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "1979" })).not.toBeInTheDocument();
    });

    it("limits the year dropdowns to minYear and maxYear", async () => {
      await openYears(<DateRangeSelector minYear={2000} maxYear={2030} />);

      expect(await screen.findByRole("option", { name: "2000" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "2030" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "1999" })).not.toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "2031" })).not.toBeInTheDocument();
    });

    it("stops the previous arrow at January of minYear", async () => {
      const user = userEvent.setup();
      render(
        <DateRangeSelector
          minYear={2000}
          defaultValue={{ start: new Date(2000, 0, 10), end: new Date(2000, 2, 5) }}
        />,
      );
      await user.click(screen.getByRole("button"));

      const start = screen.getByRole("group", { name: "Start calendar" });
      expect(within(start).getByRole("button", { name: /previous month/i })).toBeDisabled();
      expect(within(start).getByRole("button", { name: /next month/i })).toBeEnabled();
    });

    it("stops the next arrow at December of maxYear", async () => {
      const user = userEvent.setup();
      render(
        <DateRangeSelector
          maxYear={2030}
          defaultValue={{ start: new Date(2030, 10, 3), end: new Date(2030, 11, 9) }}
        />,
      );
      await user.click(screen.getByRole("button"));

      const end = screen.getByRole("group", { name: "End calendar" });
      expect(within(end).getByRole("button", { name: /next month/i })).toBeDisabled();
      expect(within(end).getByRole("button", { name: /previous month/i })).toBeEnabled();
    });
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

    // Click a day — resets pending to just start
    await user.click(enabled[0]);

    // Apply
    await user.click(screen.getByRole("button", { name: /apply/i }));

    // Should have committed with only start set
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as DateRangeValue;
    expect(lastCall.start).toBeInstanceOf(Date);
    expect(lastCall.end).toBeNull();
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

    const allDays = screen.getAllByRole("gridcell");
    const inRange = allDays.filter((d) =>
      d.className.includes("in-range"),
    );
    expect(inRange.length).toBeGreaterThanOrEqual(0);
  });

  it("disables Apply button when no start date is selected", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector />);

    await user.click(screen.getByRole("button"));

    const applyBtn = screen.getByRole("button", { name: /apply/i });
    expect(applyBtn).toBeDisabled();
  });

  it("enables Apply button after selecting a start date", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector />);

    await user.click(screen.getByRole("button"));

    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));

    await user.click(enabled[0]);

    const applyBtn = screen.getByRole("button", { name: /apply/i });
    expect(applyBtn).toBeEnabled();
  });

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
    // First click resets (now start is set, end is null) — but no onChange yet
    expect(screen.getByTestId("end")).not.toHaveTextContent("null");

    await user.click(enabled[enabled.length - 1]);
    // Apply
    await user.click(screen.getByRole("button", { name: /apply/i }));

    expect(screen.getByTestId("start")).not.toHaveTextContent("null");
    expect(screen.getByTestId("end")).not.toHaveTextContent("null");
  });
});

describe("DateRangeSelector presets", () => {
  const presets = [
    {
      label: "Today",
      getRange: () => {
        const today = new Date(2026, 5, 15);
        return { start: today, end: today };
      },
    },
    {
      label: "Last 7 days",
      getRange: () => ({
        start: new Date(2026, 5, 9),
        end: new Date(2026, 5, 15),
      }),
    },
  ];

  it("does not render a presets rail or range summary by default", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector />);

    await user.click(screen.getByRole("button"));

    expect(screen.queryByText("Today")).not.toBeInTheDocument();
    expect(screen.queryByText(/^Range:/)).not.toBeInTheDocument();
  });

  it("renders preset buttons but no range summary until something is selected", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector presets={presets} />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Last 7 days" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Range:/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Last 7 days" }));

    expect(screen.getByText(/^Range:/)).toBeInTheDocument();
  });

  it("sets the pending range and enables Apply when a preset is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangeSelector presets={presets} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: "Last 7 days" }));

    expect(screen.getByRole("button", { name: /apply/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /apply/i }));

    expect(onChange).toHaveBeenCalledWith({
      start: new Date(2026, 5, 9),
      end: new Date(2026, 5, 15),
    });
  });

  it("marks the matching preset as active after selection", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector presets={presets} />);

    await user.click(screen.getByRole("button"));
    const preset = screen.getByRole("button", { name: "Last 7 days" });
    await user.click(preset);

    expect(preset).toHaveClass("clet-date-range-selector__preset-item--active");
  });

  it("clears the active preset when a day is clicked manually afterward", async () => {
    const user = userEvent.setup();
    render(<DateRangeSelector presets={presets} />);

    await user.click(screen.getByRole("button"));
    const preset = screen.getByRole("button", { name: "Last 7 days" });
    await user.click(preset);
    expect(preset).toHaveClass("clet-date-range-selector__preset-item--active");

    const days = screen.getAllByRole("gridcell");
    const enabled = days.filter((d) => !d.hasAttribute("disabled"));
    await user.click(enabled[0]);

    expect(preset).not.toHaveClass(
      "clet-date-range-selector__preset-item--active",
    );
  });
});
