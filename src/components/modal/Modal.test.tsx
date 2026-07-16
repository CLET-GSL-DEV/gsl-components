import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../button/Button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
} from "./Modal";

function renderModal({
  showCloseButton = false,
  classNames,
}: {
  showCloseButton?: boolean;
  classNames?: { content?: string; overlay?: string; header?: string };
} = {}) {
  return render(
    <Modal>
      <ModalTrigger asChild>
        <Button>Open modal</Button>
      </ModalTrigger>
      <ModalPortal>
        <ModalOverlay classNames={{ overlay: classNames?.overlay }} />
        <ModalContent
          showCloseButton={showCloseButton}
          classNames={{ content: classNames?.content }}
        >
          <ModalHeader classNames={{ header: classNames?.header }}>
            <ModalTitle>Review changes</ModalTitle>
            <ModalDescription>Confirm before publishing.</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <p>Modal body content</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost">Cancel</Button>
            <Button>Publish</Button>
          </ModalFooter>
        </ModalContent>
      </ModalPortal>
    </Modal>,
  );
}

describe("Modal", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Modal body content")).toBeInTheDocument();
  });

  it("renders title and description with accessible roles", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(
      screen.getByRole("heading", { name: "Review changes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Confirm before publishing."),
    ).toBeInTheDocument();
  });

  it("renders header, body, and footer layout regions", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(document.querySelector(".clet-modal__header")).toBeInTheDocument();
    expect(document.querySelector(".clet-modal__body")).toBeInTheDocument();
    expect(document.querySelector(".clet-modal__footer")).toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Open modal" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Open modal" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const overlay = document.querySelector(".clet-modal__overlay");
    expect(overlay).toBeTruthy();
    await user.click(overlay!);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderModal({ showCloseButton: true });

    await user.click(screen.getByRole("button", { name: "Open modal" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close modal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("merges classNames onto overlay, content, and header", async () => {
    const user = userEvent.setup();
    renderModal({
      classNames: {
        overlay: "custom-overlay",
        content: "custom-content",
        header: "custom-header",
      },
    });

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(document.querySelector(".clet-modal__overlay")).toHaveClass(
      "clet-modal__overlay",
      "custom-overlay",
    );
    expect(screen.getByRole("dialog")).toHaveClass(
      "clet-modal",
      "custom-content",
    );
    expect(document.querySelector(".clet-modal__header")).toHaveClass(
      "clet-modal__header",
      "custom-header",
    );
  });
});
