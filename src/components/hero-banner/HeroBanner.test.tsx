import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroBanner } from "./HeroBanner";

describe("HeroBanner", () => {
  it("renders greeting, name, and an explicit date", () => {
    render(
      <HeroBanner
        greeting="Good morning,"
        name="Joseph Ekow Acquah"
        date="Sunday, 30 August 2026"
      />,
    );
    expect(screen.getByText("Good morning,")).toBeInTheDocument();
    expect(screen.getByText("Joseph Ekow Acquah")).toBeInTheDocument();
    expect(screen.getByText("Sunday, 30 August 2026")).toBeInTheDocument();
  });

  it("defaults the date to today", () => {
    const expected = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    render(<HeroBanner name="Joseph Ekow Acquah" />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("renders the role only when provided", () => {
    const { rerender } = render(<HeroBanner name="Ama" />);
    expect(screen.queryByText("Director General")).toBeNull();

    rerender(<HeroBanner name="Ama" role="Director General" />);
    expect(screen.getByText("Director General")).toBeInTheDocument();
  });

  it("selects the image by variant index", () => {
    const { rerender } = render(
      <HeroBanner
        name="Ama"
        images={[
          { src: "one.jpg", alt: "One" },
          { src: "two.jpg", alt: "Two" },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: "One" })).toBeInTheDocument();

    rerender(
      <HeroBanner
        name="Ama"
        images={[
          { src: "one.jpg", alt: "One" },
          { src: "two.jpg", alt: "Two" },
        ]}
        imageVariant={1}
      />,
    );
    expect(screen.getByRole("img", { name: "Two" })).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLElement>();
    render(<HeroBanner ref={ref} name="Ama" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
