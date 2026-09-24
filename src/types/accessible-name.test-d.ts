/**
 * DS-03 is enforced by the compiler, so it is tested at the compiler.
 *
 * These assertions are the real gate: a future refactor that makes the name
 * optional again fails here rather than silently un-fixing the audit finding.
 *
 * Note what is NOT asserted: passing both aria-label and aria-labelledby is
 * still accepted by the compiler, because a spread relaxes excess-property
 * checking on the union. Double-naming is caught by the repo rule
 * `picker-needs-accessible-name` instead.
 */
import { describe, it } from "vitest";
import type { ComboboxProps } from "./combobox";
import type { DropdownProps } from "./dropdown";

const dropdownBase = {
	value: null,
	onValueChange: (_value: string | null) => {},
	options: [],
};

const comboboxBase = {
	value: null,
	onValueChange: (_value: string | null) => {},
	options: [],
};

describe("Dropdown requires an accessible name", () => {
	it("accepts aria-label", () => {
		const props: DropdownProps = {
			...dropdownBase,
			"aria-label": "Rows per page",
		};
		void props;
	});

	it("accepts aria-labelledby", () => {
		const props: DropdownProps = {
			...dropdownBase,
			"aria-labelledby": "status-label",
		};
		void props;
	});

	it("rejects a dropdown with no name at all", () => {
		// @ts-expect-error - an unnamed Dropdown announces its value, not its purpose
		const props: DropdownProps = dropdownBase;
		void props;
	});

});

describe("Combobox requires an accessible name", () => {
	it("accepts aria-label", () => {
		const props: ComboboxProps = {
			...comboboxBase,
			"aria-label": "Assignee",
		};
		void props;
	});

	it("rejects a combobox with no name at all", () => {
		// @ts-expect-error - an unnamed Combobox announces its value, not its purpose
		const props: ComboboxProps = comboboxBase;
		void props;
	});
});
