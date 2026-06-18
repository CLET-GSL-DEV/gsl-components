import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders header", () => {
    render(<Card header="Title">Body</Card>);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("merges className on root", () => {
    const { container } = render(<Card className="custom">X</Card>);
    expect(container.firstElementChild).toHaveClass("custom");
    expect(container.firstElementChild).toHaveClass("gsl-card");
  });

  it("applies classNames parts", () => {
    const { container } = render(
      <Card classNames={{ root: "root-custom", header: "header-custom", body: "body-custom" }} header="H">
        B
      </Card>,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass("root-custom");
    expect(root.querySelector(".gsl-card__header")).toHaveClass("header-custom");
    expect(root.querySelector(".gsl-card__body")).toHaveClass("body-custom");
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={ref}>X</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders without header", () => {
    const { container } = render(<Card>Just body</Card>);
    expect(container.querySelector(".gsl-card__header")).toBeNull();
    expect(container.querySelector(".gsl-card__body")).toBeInTheDocument();
  });
});
