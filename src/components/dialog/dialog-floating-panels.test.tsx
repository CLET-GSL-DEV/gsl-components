import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button/Button";
import { Combobox } from "../combobox/Combobox";
import { Dropdown } from "../dropdown/Dropdown";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
} from "../modal/Modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "./Dialog";

const COMBOBOX_OPTIONS = [
  { value: "one", label: "Option One" },
  { value: "two", label: "Option Two" },
];

const DROPDOWN_OPTIONS = [
  { value: "one", label: "Option One" },
  { value: "two", label: "Option Two" },
];

/**
 * Combobox and Dropdown portal their menus to document.body, making them DOM
 * siblings of a Dialog or Modal. Radix's DismissableLayer therefore reads the
 * focus move when a menu opens, and the pointerdown on an option, as "outside
 * the dialog" and would close the whole overlay. These tests pin the guards
 * that keep the overlay open while a floating panel is being used.
 */

function DialogCase({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign</DialogTitle>
            </DialogHeader>
            <DialogBody>{children}</DialogBody>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

function ModalCase({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Assign</ModalTitle>
            </ModalHeader>
            <ModalBody>{children}</ModalBody>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </div>
  );
}

async function openOverlay(openButtonName: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: openButtonName }));
}

describe("pickers inside a Dialog keep the Dialog open", () => {
  it("opens a Combobox, filters, and picks an option without closing the Dialog", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DialogCase>
        <Combobox
          aria-label="Assignee"
          options={COMBOBOX_OPTIONS}
          value={null}
          onValueChange={onValueChange}
        />
      </DialogCase>,
    );
    await openOverlay("Open dialog");
    await user.click(screen.getByRole("button", { name: "Assignee" }));

    expect(document.querySelector(".clet-dialog__content[data-state='open']")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Option One" })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Search..."), "Two");
    expect(screen.queryByRole("option", { name: "Option One" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Option Two" }));
    expect(onValueChange).toHaveBeenCalledWith("two");
    expect(document.querySelector(".clet-dialog__content[data-state='open']")).toBeTruthy();
  });

  it("opens a Dropdown without closing the Dialog", async () => {
    const user = userEvent.setup();
    render(
      <DialogCase>
        <Dropdown
          aria-label="Status"
          options={DROPDOWN_OPTIONS}
          value={null}
          onValueChange={vi.fn()}
        />
      </DialogCase>,
    );
    await openOverlay("Open dialog");
    await user.click(screen.getByRole("combobox", { name: "Status" }));

    expect(document.querySelector(".clet-dialog__content[data-state='open']")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Option One" })).toBeInTheDocument();
  });

  it("still closes on a genuine outside click", async () => {
    const user = userEvent.setup();
    render(
      <DialogCase>
        <Combobox
          aria-label="Assignee"
          options={COMBOBOX_OPTIONS}
          value={null}
          onValueChange={vi.fn()}
        />
      </DialogCase>,
    );
    await openOverlay("Open dialog");
    await user.click(screen.getByRole("button", { name: "Assignee" }));
    expect(document.querySelector(".clet-dialog__content[data-state='open']")).toBeTruthy();

    await user.keyboard("{Escape}");
    await user.keyboard("{Escape}");
    expect(document.querySelector(".clet-dialog__content[data-state='open']")).toBeNull();
  });
});

describe("pickers inside a Modal keep the Modal open", () => {
  it("opens a Combobox and picks an option without closing the Modal", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ModalCase>
        <Combobox
          aria-label="Assignee"
          options={COMBOBOX_OPTIONS}
          value={null}
          onValueChange={onValueChange}
        />
      </ModalCase>,
    );
    await openOverlay("Open modal");
    await user.click(screen.getByRole("button", { name: "Assignee" }));

    expect(document.querySelector(".clet-modal[data-state='open']")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Option One" })).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Option Two" }));
    expect(onValueChange).toHaveBeenCalledWith("two");
    expect(document.querySelector(".clet-modal[data-state='open']")).toBeTruthy();
  });

  it("opens a Dropdown without closing the Modal", async () => {
    const user = userEvent.setup();
    render(
      <ModalCase>
        <Dropdown
          aria-label="Status"
          options={DROPDOWN_OPTIONS}
          value={null}
          onValueChange={vi.fn()}
        />
      </ModalCase>,
    );
    await openOverlay("Open modal");
    await user.click(screen.getByRole("combobox", { name: "Status" }));

    expect(document.querySelector(".clet-modal[data-state='open']")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Option One" })).toBeInTheDocument();
  });
});
