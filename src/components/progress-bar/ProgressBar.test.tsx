import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders determinate progress with aria attributes", () => {
    render(<ProgressBar value={60} max={100} label="Upload progress" />);

    const progressbar = screen.getByRole("progressbar", {
      name: "Upload progress",
    });
    expect(progressbar).toHaveClass("clet-progress-bar", "clet-progress-bar--default");
    expect(progressbar).toHaveAttribute("aria-valuenow", "60");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps value below zero and above max", () => {
    const { rerender } = render(<ProgressBar value={-10} max={100} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");

    rerender(<ProgressBar value={150} max={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("omits aria-valuenow in indeterminate mode", () => {
    render(<ProgressBar indeterminate label="Loading" />);

    const progressbar = screen.getByRole("progressbar", { name: "Loading" });
    expect(progressbar).toHaveClass("clet-progress-bar--indeterminate");
    expect(progressbar).not.toHaveAttribute("aria-valuenow");
  });

  it("applies variant and size class names", () => {
    render(<ProgressBar value={50} variant="success" size="md" />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("clet-progress-bar--success", "clet-progress-bar--md");
  });

  it("renders percentage text when showValue is true", () => {
    render(<ProgressBar value={75} showValue />);

    expect(screen.getByText("75%")).toHaveClass("clet-progress-bar__value");
    expect(screen.getByRole("progressbar")).toHaveClass(
      "clet-progress-bar--with-value",
    );
  });

  it("merges className and classNames without dropping base classes", () => {
    render(
      <ProgressBar
        value={25}
        className="extra-root"
        classNames={{ root: "custom-root", indicator: "custom-indicator" }}
      />,
    );

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("clet-progress-bar", "custom-root", "extra-root");
    expect(progressbar.querySelector(".clet-progress-bar__indicator")).toHaveClass(
      "custom-indicator",
    );
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();

    render(<ProgressBar ref={ref} value={40} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "progressbar");
  });
});
