# Theming
===RULE===
id: theming-no-hardcoded-colors
title: Never hardcode colors — always use theme tokens
severity: dont
components:

Never hardcode colors such as `#fff` or Tailwind palette classes like `text-blue-600`. Always use
this library's theme tokens instead — `text-foreground`, `bg-surface-muted`, `text-error`, and
similar. This holds even for small stylistic touches like a link-styled button; reach for a token
class, not a raw palette color, in every case.

===RULE===
id: theming-no-global-token-mutation-for-one-element
title: Don't mutate global accent tokens to reskin a single element
severity: dont
components:

Don't change global accent/theme tokens just to restyle one specific element. Instead apply a
scoped Tailwind color class directly to that element, leaving the shared tokens untouched for the
rest of the app.

===RULE===
id: theming-subtle-surface-opacity
title: Prefer a translucent muted surface over the harsher plain one
severity: do
components: modal, card

For a subtle or muted surface — for example a card background nested inside a modal — prefer
`bg-surface-muted/20` over the plain `bg-surface-muted`, which reads too harsh in that context.

===RULE===
id: theming-use-gsltheme-for-token-overrides
title: Use gslTheme() to override design tokens, not hand-written CSS
severity: do
components: theme

To override any `--gsl-*` token (global, like `primary`/`radiusBase`, or component-scoped, like
Card's `padding` or AppHeader's `bg`), call the `gslTheme()` runtime helper exported from
`@rfdtech/components` — pass `all`/`light`/`dark` for global tokens, or `components: { ComponentName:
{...} }` for a specific component's own tokens. It's fully type-checked against the real token
registry (unknown keys and mismatched value shapes are compile errors), and it injects one `<style>`
tag with no build config or separate CSS file needed. Reach for a hand-written CSS override file
(documented as a fallback) only when you need conditional/media-query logic `gslTheme()` can't
express. See `get_component("theme")` for the full API and `get_tokens()` for every valid token name.
