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
id: theming-use-clettheme-for-token-overrides
title: Use cletTheme() to override design tokens, not hand-written CSS
severity: do
components: theme

To override any `--clet-*` token (global, like `primary`/`radiusBase`, or component-scoped, like
Card's `padding` or AppHeader's `bg`), call the `cletTheme()` runtime helper exported from
`@rfdtech/components` — pass `all`/`light`/`dark` for global tokens, or `components: { ComponentName:
{...} }` for a specific component's own tokens. It's fully type-checked against the real token
registry (unknown keys and mismatched value shapes are compile errors), and it injects one `<style>`
tag with no build config or separate CSS file needed. Reach for a hand-written CSS override file
(documented as a fallback) only when you need conditional/media-query logic `cletTheme()` can't
express. See `get_component("theme")` for the full API and `get_tokens()` for every valid token name.
Put the call in a `src/clet.theme.ts` file, side-effect-imported once in the app entry point (see
`get_component("theme")` for the recommended-file convention).

===RULE===
id: theming-migration-ask-about-existing-token-overrides
title: When migrating, ask the user about each existing `--clet-*` token override — don't silently keep or drop any
severity: do
components: theme

When migrating a project onto the new design system defaults, first find every existing override
of a **known `--clet-*` token** — a `cletTheme()` call (in `src/clet.theme.ts` or elsewhere), or
hand-written CSS setting a real `--clet-*` custom property. This does not include custom/arbitrary
CSS variables or component-local one-off styling that isn't a recognized library token — only
overrides of tokens the library itself defines (cross-check against `get_tokens()`).

List every overridden token found, then ask the user about each one individually — keep the
existing override (preserve current branding for that token), or drop it and adopt the new
approved default. Don't decide this silently and don't batch it into a single yes/no — a token like
`--clet-primary` might be an intentional brand choice worth keeping, while another was only ever set
to match the *old* pre-rebrand defaults and should be dropped now that those defaults themselves
changed. See the "Rebrand" section of `get_component("migration-v2")` for the specific old→new
default values that changed.
