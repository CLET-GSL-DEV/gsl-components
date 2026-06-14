import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders label and calls onClick when enabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass("gsl-button--secondary", "gsl-button--md");
    expect(button).toBeEnabled();

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant and size class names", () => {
    render(
      <Button variant="primary" size="lg">
        Submit
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveClass("gsl-button--primary", "gsl-button--lg");
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when loading and shows spinner", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button loading loadingLabel="Saving" onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveClass("gsl-button--loading");
    expect(button.querySelector(".gsl-button__spinner")).toBeInTheDocument();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("merges classNames onto root, label, and spinner", () => {
    render(
      <Button
        loading
        loadingLabel="Saving"
        classNames={{
          root: "custom-root",
          label: "custom-label",
          spinner: "custom-spinner",
        }}
      >
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toHaveClass("gsl-button", "custom-root");
    expect(button.querySelector(".gsl-button__label")).toHaveClass("custom-label");
    expect(button.querySelector(".gsl-button__spinner")).toHaveClass("custom-spinner");
  });
});
