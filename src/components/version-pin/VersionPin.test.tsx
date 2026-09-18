import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VersionPin } from "./VersionPin";

describe("VersionPin", () => {
  it("stamps data-clet-version and data-gsl-version", () => {
    const { container } = render(
      <VersionPin version="2.2">
        <span>pinned</span>
      </VersionPin>,
    );
    expect(screen.getByText("pinned")).toBeInTheDocument();
    const root = container.querySelector(".clet-version-pin")!;
    expect(root).toHaveAttribute("data-clet-version", "2.2");
    expect(root).toHaveAttribute("data-gsl-version", "2.2");
  });

  it("merges className and classNames.root", () => {
    const { container } = render(
      <VersionPin version="1.22" className="custom" classNames={{ root: "inner" }}>
        x
      </VersionPin>,
    );
    const root = container.querySelector(".clet-version-pin")!;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("inner");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<VersionPin ref={ref} version="2.3">x</VersionPin>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
