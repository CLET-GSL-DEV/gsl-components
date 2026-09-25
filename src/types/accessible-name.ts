/**
 * Every control that a screen reader must be able to announce carries one of
 * these, and carrying neither is a type error.
 *
 * DS-03 in the accessibility audit was a Dropdown whose only text was its
 * selected value ("10 per page"), so the control announced its state and never
 * its purpose. An optional `aria-label` did not prevent that; a required one
 * does.
 *
 * It is a union rather than a required `aria-label` on purpose: a control with
 * a visible <label> should point at it with `aria-labelledby`, and forcing a
 * second, invisible name onto it would create a different failure. Supply
 * exactly one.
 */
export type AccessibleName =
	| { "aria-label": string; "aria-labelledby"?: never }
	| { "aria-labelledby": string; "aria-label"?: never };
