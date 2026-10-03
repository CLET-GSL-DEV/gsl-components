import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  it("defaults to the outlined appearance and offers filled", () => {
    const { container, rerender } = render(<Banner heading="Hi" />);
    expect(container.querySelector(".clet-banner--outlined")).toBeInTheDocument();
    rerender(<Banner heading="Hi" appearance="filled" />);
    expect(container.querySelector(".clet-banner--filled")).toBeInTheDocument();
  });

  it("offers no toggle when the subtext fits in two lines", () => {
    render(<Banner heading="Hi" subtext="Short." />);
    expect(screen.queryByRole("button", { name: "Read more" })).toBeNull();
  });

  describe("when the subtext overflows two lines", () => {
    const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
    const client = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");

    beforeEach(() => {
      Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
        configurable: true,
        get() {
          return 90;
        },
      });
      Object.defineProperty(HTMLElement.prototype, "clientHeight", {
        configurable: true,
        get() {
          return 36;
        },
      });
    });

    afterEach(() => {
      if (scroll) Object.defineProperty(HTMLElement.prototype, "scrollHeight", scroll);
      if (client) Object.defineProperty(HTMLElement.prototype, "clientHeight", client);
    });

    it("expands in place and collapses again", async () => {
      const { container } = render(<Banner heading="Hi" subtext="A long subtext." />);
      const more = await screen.findByRole("button", { name: "Read more" });
      expect(more).toHaveAttribute("aria-expanded", "false");
      expect(container.querySelector(".clet-banner__subtext--clamped")).toBeInTheDocument();

      await userEvent.click(more);
      const less = screen.getByRole("button", { name: "Show less" });
      expect(less).toHaveAttribute("aria-expanded", "true");
      expect(container.querySelector(".clet-banner__subtext--clamped")).toBeNull();

      await userEvent.click(less);
      expect(await screen.findByRole("button", { name: "Read more" })).toBeInTheDocument();
    });

    it("takes custom toggle labels", async () => {
      render(
        <Banner heading="Hi" subtext="A long subtext." expandLabel="More" collapseLabel="Less" />,
      );
      await userEvent.click(await screen.findByRole("button", { name: "More" }));
      expect(screen.getByRole("button", { name: "Less" })).toBeInTheDocument();
    });
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Banner ref={ref} heading="Hi" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
