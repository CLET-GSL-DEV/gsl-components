import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Step, StepLabel, Stepper } from ".";

function renderStepper({
  value = 2,
  clickable = false,
  onValueChange,
}: {
  value?: number;
  clickable?: boolean;
  onValueChange?: (v: number) => void;
} = {}) {
  return render(
    <Stepper value={value} clickable={clickable} onValueChange={onValueChange}>
      <Step value={1}>
        <StepLabel>Upload Document</StepLabel>
      </Step>
      <Step value={2}>
        <StepLabel>Select header row</StepLabel>
      </Step>
      <Step value={3}>
        <StepLabel>Validate data</StepLabel>
      </Step>
    </Stepper>,
  );
}

describe("Stepper", () => {
  it("renders an ordered list of steps", () => {
    renderStepper();

    const list = screen.getByRole("list");
    expect(list).toHaveClass("clet-stepper");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("merges classNames and className on the root", () => {
    render(
      <Stepper value={1} classNames={{ root: "custom-root" }} className="extra">
        <Step value={1}>
          <StepLabel>One</StepLabel>
        </Step>
      </Stepper>,
    );

    expect(screen.getByRole("list")).toHaveClass(
      "clet-stepper",
      "custom-root",
      "extra",
    );
  });

  it("filters out non-Step children", () => {
    render(
      <Stepper value={1}>
        <div data-testid="invalid">Not a step</div>
        <Step value={1} data-testid="valid">
          <StepLabel>One</StepLabel>
        </Step>
      </Stepper>,
    );

    expect(screen.queryByTestId("invalid")).not.toBeInTheDocument();
    expect(screen.getByTestId("valid")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("exposes forwardRef on the root", () => {
    const ref = createRef<HTMLOListElement>();

    render(
      <Stepper value={1} ref={ref}>
        <Step value={1}>
          <StepLabel>One</StepLabel>
        </Step>
      </Stepper>,
    );

    expect(ref.current).toBeInstanceOf(HTMLOListElement);
  });
});

describe("Step state", () => {
  it("marks steps before value as complete", () => {
    renderStepper({ value: 2 });

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveClass("clet-stepper__item--complete");
  });

  it("marks the active step and sets aria-current", () => {
    renderStepper({ value: 2 });

    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveClass("clet-stepper__item--active");
    expect(items[1]).toHaveAttribute("aria-current", "step");
  });

  it("marks steps after value as upcoming", () => {
    renderStepper({ value: 2 });

    const items = screen.getAllByRole("listitem");
    expect(items[2]).toHaveClass("clet-stepper__item--upcoming");
  });

  it("shows the step number for incomplete steps", () => {
    renderStepper({ value: 2 });

    const items = screen.getAllByRole("listitem");
    // active step (2) shows its number
    expect(items[1].querySelector(".clet-stepper__number")).toHaveTextContent("2");
    // upcoming step (3) shows its number
    expect(items[2].querySelector(".clet-stepper__number")).toHaveTextContent("3");
  });

  it("shows a check icon for complete steps and hides the number", () => {
    renderStepper({ value: 2 });

    const items = screen.getAllByRole("listitem");
    const completeMarker = items[0].querySelector(".clet-stepper__marker");
    expect(completeMarker?.querySelector(".clet-stepper__check")).toBeInTheDocument();
    expect(items[0].querySelector(".clet-stepper__number")).toHaveClass(
      "clet-stepper__number--hidden",
    );
  });

  it("renders a connector on every step except the last", () => {
    renderStepper({ value: 2 });

    const items = screen.getAllByRole("listitem");
    expect(items[0].querySelector(".clet-stepper__connector")).toBeInTheDocument();
    expect(items[1].querySelector(".clet-stepper__connector")).toBeInTheDocument();
    expect(items[2].querySelector(".clet-stepper__connector")).toBeNull();
  });

  it("fills the connector of a completed step", () => {
    renderStepper({ value: 2 });

    const items = screen.getAllByRole("listitem");
    const completeFill = items[0].querySelector(".clet-stepper__connector-fill");
    const activeFill = items[1].querySelector(".clet-stepper__connector-fill");
    expect(completeFill).toHaveClass("clet-stepper__connector-fill--visible");
    expect(activeFill).not.toHaveClass("clet-stepper__connector-fill--visible");
  });

  it("exposes forwardRef on Step", () => {
    const ref = createRef<HTMLLIElement>();

    render(
      <Stepper value={1}>
        <Step value={1} ref={ref}>
          <StepLabel>One</StepLabel>
        </Step>
      </Stepper>,
    );

    expect(ref.current).toBeInstanceOf(HTMLLIElement);
  });

  it("merges classNames on Step parts", () => {
    render(
      <Stepper value={2}>
        <Step
          value={1}
          data-testid="item"
          classNames={{
            root: "item-root",
            marker: "item-marker",
            connector: "item-connector",
          }}
        >
          <StepLabel>One</StepLabel>
        </Step>
        <Step value={2}>
          <StepLabel>Two</StepLabel>
        </Step>
      </Stepper>,
    );

    const item = screen.getByTestId("item");
    expect(item).toHaveClass("item-root");
    expect(item.querySelector(".clet-stepper__marker")).toHaveClass("item-marker");
    expect(item.querySelector(".clet-stepper__connector")).toHaveClass(
      "item-connector",
    );
  });
});

describe("Step clickable", () => {
  it("renders a button for each step when clickable", () => {
    renderStepper({ clickable: true });

    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("does not render buttons when not clickable", () => {
    renderStepper({ clickable: false });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onValueChange with the step value when clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderStepper({ clickable: true, value: 2, onValueChange });

    await user.click(screen.getByRole("button", { name: "Go to step 1" }));

    expect(onValueChange).toHaveBeenCalledWith(1);
  });

  it("does not render a button for a disabled step", () => {
    render(
      <Stepper value={2} clickable>
        <Step value={1}>
          <StepLabel>One</StepLabel>
        </Step>
        <Step value={2} disabled data-testid="disabled">
          <StepLabel>Two</StepLabel>
        </Step>
      </Stepper>,
    );

    const disabledItem = screen.getByTestId("disabled");
    expect(disabledItem).toHaveClass("clet-stepper__item--disabled");
    expect(disabledItem.querySelector("button")).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});

describe("StepLabel", () => {
  it("renders children in a span with the label class", () => {
    render(
      <Stepper value={1}>
        <Step value={1}>
          <StepLabel data-testid="lbl">Upload Document</StepLabel>
        </Step>
      </Stepper>,
    );

    const lbl = screen.getByTestId("lbl");
    expect(lbl.tagName).toBe("SPAN");
    expect(lbl).toHaveClass("clet-stepper__label");
    expect(lbl).toHaveTextContent("Upload Document");
  });

  it("merges classNames and className", () => {
    render(
      <Stepper value={1}>
        <Step value={1}>
          <StepLabel
            classNames={{ root: "lbl-extra" }}
            className="lbl-more"
            data-testid="lbl"
          >
            One
          </StepLabel>
        </Step>
      </Stepper>,
    );

    expect(screen.getByTestId("lbl")).toHaveClass(
      "clet-stepper__label",
      "lbl-extra",
      "lbl-more",
    );
  });

  it("exposes forwardRef", () => {
    const ref = createRef<HTMLSpanElement>();

    render(
      <Stepper value={1}>
        <Step value={1}>
          <StepLabel ref={ref}>One</StepLabel>
        </Step>
      </Stepper>,
    );

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

describe("Stepper namespace", () => {
  it("exposes Step and StepLabel as static members", () => {
    expect(Stepper.Step).toBe(Step);
    expect(Stepper.StepLabel).toBe(StepLabel);
  });
});

describe("Step outside a Stepper", () => {
  it("throws a clear error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() =>
      render(
        <Step value={1}>
          <StepLabel>One</StepLabel>
        </Step>,
      ),
    ).toThrow(/Step must be used within a Stepper/);

    spy.mockRestore();
  });
});
