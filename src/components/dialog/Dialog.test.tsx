import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";

function renderDialog({
  showCloseButton = false,
  classNames,
}: {
  showCloseButton?: boolean;
  classNames?: { content?: string; overlay?: string };
} = {}) {
  return render(
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay classNames={{ overlay: classNames?.overlay }} />
        <DialogContent
          showCloseButton={showCloseButton}
          classNames={{ content: classNames?.content }}
        >
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile.</DialogDescription>
          <p>Dialog body</p>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
  );
}

describe("Dialog", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog body")).toBeInTheDocument();
  });

  it("renders title and description with accessible roles", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(
      screen.getByRole("heading", { name: "Edit profile" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Make changes to your profile."),
    ).toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const overlay = document.querySelector(".clet-dialog__overlay");
    expect(overlay).toBeTruthy();
    await user.click(overlay!);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog({ showCloseButton: true });

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("merges classNames onto overlay and content", async () => {
    const user = userEvent.setup();
    renderDialog({
      classNames: {
        overlay: "custom-overlay",
        content: "custom-content",
      },
    });

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(document.querySelector(".clet-dialog__overlay")).toHaveClass(
      "clet-dialog__overlay",
      "custom-overlay",
    );
    expect(screen.getByRole("dialog")).toHaveClass(
      "clet-dialog__content",
      "custom-content",
    );
  });
});
