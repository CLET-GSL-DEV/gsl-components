# Accessibility
===RULE===
id: accessibility-decorative-icons
title: Mark decorative icons aria-hidden
severity: do
components: toast

Decorative icons that carry no independent meaning — for example a toast's leading icon — should
be marked `aria-hidden`. Screen readers should not announce them separately from the text they
accompany.

===RULE===
id: accessibility-prefer-library-primitives
title: Prefer the library's accessible primitives over hand-rolled patterns
severity: do
components: checkbox, radio-group

Prefer this library's accessible primitives — `Checkbox`, `RadioGroup`, and similar — over
hand-rolled `sr-only`-checkbox or custom-input patterns. The library primitives already handle
keyboard interaction, focus management, and ARIA wiring correctly.

===RULE===
id: accessibility-avoid-doubled-icons
title: Check whether a component already renders its own icon before adding another
severity: do
components:

Before adding an adjacent icon (e.g. a lucide icon) next to a library component, check whether
that component already renders its own icon internally. Doubling icons is both a visual
redundancy and an accessibility redundancy — it can cause the same meaning to be announced twice.
