import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Banner } from "./Banner";

describe("Banner", () => {
  it("renders heading and subtext", () => {
    render(
      <Banner
        heading="Checklist updated"
        subtext="A new version is available for the current cycle."
      />,
    );
    expect(screen.getByText("Checklist updated")).toBeInTheDocument();
    expect(
      screen.getByText("A new version is available for the current cycle."),
    ).toBeInTheDocument();
  });

  it("defaults to the info variant with status role", () => {
    const { container } = render(<Banner heading="Hi" />);
    expect(container.querySelector(".clet-banner--info")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses alert role for the danger variant", () => {
    render(<Banner variant="danger" heading="Failed" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the close button only when onClose is provided", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Banner heading="Hi" />);
    expect(
      screen.queryByRole("button", { name: "Dismiss" }),
    ).toBeNull();

    rerender(<Banner heading="Hi" onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the action slot", () => {
    render(
      <Banner heading="Hi" action={<a href="/details">View details</a>} />,
    );
    expect(screen.getByRole("link", { name: "View details" })).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Banner ref={ref} heading="Hi" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
