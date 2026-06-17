import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

  it("applies variant class", () => {
    const { container } = render(
      <MetricCard label="Errors" value="3" variant="error" />,
    );
    expect(container.firstChild).toHaveClass("gsl-metric-card--error");
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
