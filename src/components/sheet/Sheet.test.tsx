import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../button/Button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "./Sheet";

function renderSheet({
  showCloseButton = false,
  side = "right",
  classNames,
}: {
  showCloseButton?: boolean;
  side?: "left" | "right" | "top" | "bottom";
  classNames?: { content?: string; overlay?: string; header?: string };
} = {}) {
  return render(
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open sheet</Button>
      </SheetTrigger>
      <SheetPortal>
        <SheetOverlay classNames={{ overlay: classNames?.overlay }} />
        <SheetContent
          side={side}
          showCloseButton={showCloseButton}
          classNames={{ content: classNames?.content }}
        >
          <SheetHeader classNames={{ header: classNames?.header }}>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine the results below.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p>Sheet body content</p>
          </SheetBody>
          <SheetFooter>
            <Button variant="ghost">Reset</Button>
            <Button>Apply</Button>
          </SheetFooter>
        </SheetContent>
      </SheetPortal>
    </Sheet>,
  );
}

describe("Sheet", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderSheet();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Sheet body content")).toBeInTheDocument();
  });

  it("renders title and description with accessible roles", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(screen.getByRole("heading", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByText("Refine the results below.")).toBeInTheDocument();
  });

  it("renders header, body, and footer layout regions", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(document.querySelector(".gsl-sheet__header")).toBeInTheDocument();
    expect(document.querySelector(".gsl-sheet__body")).toBeInTheDocument();
    expect(document.querySelector(".gsl-sheet__footer")).toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const overlay = document.querySelector(".gsl-sheet__overlay");
    expect(overlay).toBeTruthy();
    await user.click(overlay!);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderSheet({ showCloseButton: true });

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close sheet" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("applies side modifier classes", async () => {
    const user = userEvent.setup();
    renderSheet({ side: "left" });

    await user.click(screen.getByRole("button", { name: "Open sheet" }));

    const sheet = screen.getByRole("dialog");
    expect(sheet).toHaveClass("gsl-sheet", "gsl-sheet--left");
    expect(sheet).toHaveAttribute("data-side", "left");
  });

  it("merges classNames onto overlay, content, and header", async () => {
    const user = userEvent.setup();
    renderSheet({
      classNames: {
        overlay: "custom-overlay",
        content: "custom-content",
        header: "custom-header",
      },
    });

    await user.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(document.querySelector(".gsl-sheet__overlay")).toHaveClass(
      "gsl-sheet__overlay",
      "custom-overlay",
    );
    expect(screen.getByRole("dialog")).toHaveClass(
      "gsl-sheet",
      "gsl-sheet--right",
      "custom-content",
    );
    expect(document.querySelector(".gsl-sheet__header")).toHaveClass(
      "gsl-sheet__header",
      "custom-header",
    );
  });
});
