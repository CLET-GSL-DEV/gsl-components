/**
 * DS-02 (focus lands on <body> after close) and DS-06 (no aria-modal).
 *
 * Both are invisible in a snapshot and invisible in JSX review, which is how
 * they shipped. They are only observable by driving the component, so they are
 * tested by driving it.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./Dialog";
import { Modal, ModalContent, ModalTitle } from "../modal/Modal";

function BasicDialog() {
	return (
		<Dialog>
			<DialogTrigger>Open</DialogTrigger>
			<DialogContent>
				<DialogTitle>A question</DialogTitle>
				<button type="button">Inside</button>
			</DialogContent>
		</Dialog>
	);
}

/** The DS-02 shape: the control that opened the dialog is gone by the time it closes. */
function DialogWithVanishingTrigger() {
	const [menuOpen, setMenuOpen] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const anchorRef = useRef<HTMLButtonElement>(null);
	return (
		<>
			<button type="button" ref={anchorRef}>
				Row actions
			</button>
			{menuOpen ? (
				<button
					type="button"
					onClick={() => {
						setMenuOpen(false);
						setDialogOpen(true);
					}}
				>
					Delete
				</button>
			) : null}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent returnFocusTo={anchorRef}>
					<DialogTitle>Delete this row?</DialogTitle>
					<button type="button" onClick={() => setDialogOpen(false)}>
						Confirm
					</button>
				</DialogContent>
			</Dialog>
		</>
	);
}

describe("Dialog accessibility", () => {
	it("marks the dialog as modal so the page behind it is not announced", async () => {
		const user = userEvent.setup();
		render(<BasicDialog />);
		await user.click(screen.getByText("Open"));
		const dialog = await screen.findByRole("dialog");
		expect(dialog).toHaveAttribute("aria-modal", "true");
	});

	it("does not claim aria-modal when the root is non-modal", async () => {
		const user = userEvent.setup();
		render(
			<Dialog modal={false}>
				<DialogTrigger>Open</DialogTrigger>
				<DialogContent>
					<DialogTitle>A question</DialogTitle>
				</DialogContent>
			</Dialog>,
		);
		await user.click(screen.getByText("Open"));
		const dialog = await screen.findByRole("dialog");
		expect(dialog).not.toHaveAttribute("aria-modal");
	});

	it("returns focus to the trigger on Escape", async () => {
		const user = userEvent.setup();
		render(<BasicDialog />);
		const trigger = screen.getByText("Open");
		await user.click(trigger);
		await screen.findByRole("dialog");
		await user.keyboard("{Escape}");
		await waitFor(() => expect(trigger).toHaveFocus());
	});

	it("lands on returnFocusTo, not <body>, when the trigger has unmounted", async () => {
		const user = userEvent.setup();
		render(<DialogWithVanishingTrigger />);
		await user.click(screen.getByText("Delete"));
		await screen.findByRole("dialog");
		expect(screen.queryByText("Delete")).not.toBeInTheDocument();
		await user.click(screen.getByText("Confirm"));
		await waitFor(() =>
			expect(screen.getByText("Row actions")).toHaveFocus(),
		);
		expect(document.body).not.toHaveFocus();
	});
});

describe("Modal accessibility", () => {
	it("marks the modal as modal", async () => {
		render(
			<Modal defaultOpen>
				<ModalContent>
					<ModalTitle>Edit</ModalTitle>
				</ModalContent>
			</Modal>,
		);
		const dialog = await screen.findByRole("dialog");
		expect(dialog).toHaveAttribute("aria-modal", "true");
	});

	it("returns focus to a still-mounted anchor when asked", async () => {
		const user = userEvent.setup();
		function Harness() {
			const anchorRef = useRef<HTMLButtonElement>(null);
			const [open, setOpen] = useState(true);
			return (
				<>
					<button type="button" ref={anchorRef}>
						Anchor
					</button>
					<Modal open={open} onOpenChange={setOpen}>
						<ModalContent returnFocusTo={anchorRef}>
							<ModalTitle>Edit</ModalTitle>
							<button type="button" onClick={() => setOpen(false)}>
								Done
							</button>
						</ModalContent>
					</Modal>
				</>
			);
		}
		render(<Harness />);
		await screen.findByRole("dialog");
		await user.click(screen.getByText("Done"));
		await waitFor(() => expect(screen.getByText("Anchor")).toHaveFocus());
	});
});
