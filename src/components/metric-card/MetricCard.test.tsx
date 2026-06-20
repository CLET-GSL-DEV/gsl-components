import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="Students" value="2,451" />);
    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText("2,451")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <MetricCard label="Revenue" value="$12.5k" description="vs last month" />,
    );
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("renders trend indicator with icon", () => {
    const { container } = render(
      <MetricCard label="Users" value="1,024" trend="up" trendValue="+8.3%" />,
    );
    expect(screen.getByText("+8.3%")).toBeInTheDocument();
    // lucide ArrowUp renders as an SVG
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders down trend", () => {
    render(
      <MetricCard
        label="Bounces"
        value="12"
        trend="down"
        trendValue="-3.2%"
      />,
    );
    expect(screen.getByText("-3.2%")).toBeInTheDocument();
  });

  it("renders neutral trend with Minus icon", () => {
    const { container } = render(
      <MetricCard
        label="Conversion"
        value="3.2%"
        trend="neutral"
        trendValue="0%"
      />,
    );
    expect(screen.getByText("0%")).toBeInTheDocument();
    // Minus icon renders as SVG
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(
      <MetricCard label="Sales" value="89" icon={<svg data-testid="icon" />} />,
    );
    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<MetricCard label="Test" value="0" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges className", () => {
    const { container } = render(
      <MetricCard label="Test" value="0" className="custom" />,
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("merges classNames.parts", () => {
    const { container } = render(
      <MetricCard
        label="Label"
        value="99"
        classNames={{
          root: "root-custom",
          label: "label-custom",
          value: "value-custom",
        }}
      />,
    );
    expect(container.firstChild).toHaveClass("root-custom");
    expect(screen.getByText("Label")).toHaveClass("label-custom");
    expect(screen.getByText("99")).toHaveClass("value-custom");
  });

  it("applies aria-invalid when passed", () => {
    render(<MetricCard label="Test" value="0" aria-invalid />);
    expect(screen.getByText("0").parentElement?.parentElement).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("MetricCard animation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockRafComplete() {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      now += 2000; // jump past the 1500ms default duration
      cb(now);
      return now;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(vi.fn());
  }

  it("renders initial value when animate is false", () => {
    render(<MetricCard label="Revenue" value="$128.4k" />);
    expect(screen.getByText("$128.4k")).toBeInTheDocument();
  });

  it("counts up to a numeric value when animate is true", () => {
    mockRafComplete();
    render(<MetricCard label="Users" value={2847} animate />);
    expect(screen.getByText("2847")).toBeInTheDocument();
  });

  it("counts up preserving prefix and suffix", () => {
    mockRafComplete();
    render(<MetricCard label="Revenue" value="$128.4k" animate />);
    expect(screen.getByText("$128.4k")).toBeInTheDocument();
  });

  it("counts up restoring locale comma formatting", () => {
    mockRafComplete();
    render(<MetricCard label="Students" value="2,451" animate />);
    expect(screen.getByText("2,451")).toBeInTheDocument();
  });

  it("renders plain value when animate is true but value is not parseable", () => {
    mockRafComplete();
    render(<MetricCard label="Status" value="N/A" animate />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders description alongside animated value", () => {
    mockRafComplete();
    render(
      <MetricCard
        label="Sales"
        value="$500"
        animate
        description="vs last month"
      />,
    );
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("applies classNames.value to the animated display", () => {
    mockRafComplete();
    render(
      <MetricCard
        label="Test"
        value="100"
        animate
        classNames={{ value: "animated-value" }}
      />,
    );
    expect(screen.getByText("100")).toHaveClass("animated-value");
  });
});
