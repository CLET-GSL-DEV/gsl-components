/**
 * DS-05: the search field advertises a listbox via aria-controls that did not
 * exist until you typed, so every page load shipped a dangling reference.
 *
 * cmdk hardcodes `aria-controls={listId}` after its own props spread, so this
 * cannot be fixed from the outside by passing a different attribute. The list
 * has to stay mounted, and that is what this asserts.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppHeaderSearch } from "./AppHeaderSearch";

const data = [
	{
		heading: "People",
		items: [{ value: "ada", label: "Ada Lovelace", onSelect: () => {} }],
	},
];

function resolveControlledElement(input: HTMLElement) {
	const id = input.getAttribute("aria-controls");
	expect(id, "the combobox must name the listbox it controls").toBeTruthy();
	return document.getElementById(id as string);
}

describe("AppHeaderSearch accessibility", () => {
	it("resolves aria-controls before anything is typed", () => {
		render(<AppHeaderSearch data={data} />);
		const input = screen.getByRole("combobox");
		expect(resolveControlledElement(input)).not.toBeNull();
	});

	it("resolves aria-controls with no data supplied at all", () => {
		render(<AppHeaderSearch />);
		const input = screen.getByRole("combobox");
		expect(resolveControlledElement(input)).not.toBeNull();
	});

	it("keeps the empty list out of the accessibility tree until it has results", async () => {
		const user = userEvent.setup();
		render(<AppHeaderSearch data={data} />);
		const input = screen.getByRole("combobox");
		expect(resolveControlledElement(input)).toHaveAttribute("hidden");

		await user.type(input, "ada");
		expect(resolveControlledElement(input)).not.toHaveAttribute("hidden");
		expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
	});
});
