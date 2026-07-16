# Forms
===RULE===
id: forms-required-banner
title: One "All fields are required" banner, not per-label asterisks
severity: dont
components: form, form-field

Do not put a `*` on every required field's label. Instead add one line near the top of the form:
`<p className="text-sm text-error -mt-2">All fields are required</p>`. This keeps the label row
clean and states the requirement once instead of repeating visual noise on every field.

===RULE===
id: forms-stack
title: The library's form stack
severity: info
components: form, form-field

Forms are built with `react-hook-form` + `zod` + `@hookform/resolvers/zod`, composed with this
library's `Form` / `FormField` / `Field` family. Validate with a zod schema and resolve it via
`zodResolver`, then drive rendering through `FormField`'s `render` prop.

===RULE===
id: forms-field-array-and-watch
title: Use useFieldArray for repeatable sections, form.watch for conditional fields
severity: do
components: form

Use `useFieldArray` for repeatable field sections (e.g. a dynamic list of contacts). Use
`form.watch(...)` to conditionally reveal or hide fields based on the current value of another
field, rather than tracking a duplicate piece of local state.

===RULE===
id: forms-no-unnecessary-wrappers
title: Don't wrap fields in unnecessary divs or add labels the design doesn't call for
severity: dont
components: form, form-field

Don't add extra wrapping `<div>`s around fields, and don't add a `FieldLabel` or other label text
that the design doesn't specify. Keep the field tree as flat as the `Form`/`FormField`/`Field`
composition requires and nothing more.

===RULE===
id: forms-never-native-controls
title: Never use a native select/button/input as a visible filter or form control
severity: dont
components: table, dropdown, form, form-field

Never render a raw `<select>`, native `<button>`, or native `<input>` as the visible control in a
filter or form — use the library's own components (`Dropdown`, `Button`, `Input`, etc.) instead.
This applies everywhere, but especially inside `TableFilter`: its `handleApply` reads `FormData`
from named, form-associated elements, so pass `name="role"` straight to `Dropdown` — it
participates in native form submission on its own (backed by Radix's hidden bubble `<select>`),
no separate hidden input needed. Never a bare `<select name="role">`. For other custom inputs
without built-in form participation, pair a hidden `<input type="hidden" name="..." value={...} />`
(captured by `FormData`) driving the same value instead — it's invisible plumbing, not a visible
native control.

===RULE===
id: forms-table-filter-spread-autoapply
title: TableFilter's spread variant has no Apply button — it auto-applies
severity: info
components: table

`<TableFilter variant="spread">` removes the popover and lays fields out inline with just a
"clear" action — there is no Apply button. Fields apply as soon as their value changes (the
component diffs a `FormData` snapshot after every render — a safety net for any custom input that
doesn't fire a native change event; `Dropdown`'s own `name`-driven hidden field does fire one).
Don't add your own Apply button next to a spread filter — it's redundant.
