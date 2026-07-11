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
