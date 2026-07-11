# Tokens
===RULE===
id: tokens-radius-xl
title: --gsl-radius-xl backs Tailwind's rounded-xl
severity: info
components:

`--gsl-radius-xl` is the design token that backs Tailwind's `rounded-xl` utility in this design
system. Use `rounded-xl` in markup rather than a hardcoded border-radius value.

===RULE===
id: tokens-card-padding
title: --gsl-card-padding is Card's built-in padding token
severity: info
components: card

`--gsl-card-padding` is the token that supplies Card's built-in content padding. Don't
re-implement it with utility padding classes like `px-6 py-4` — rely on the token.

===RULE===
id: tokens-catalog
title: Token catalog observed in real usage
severity: info
components:

Common tokens/utilities in use across the library and consuming apps: `text-foreground`,
`text-foreground-muted`, `bg-surface-muted`, `bg-surface-muted/20`, `bg-surface-subtle`,
`border-border`, `text-error`, `text-warning`, `bg-warning-bg`, `bg-primary`, `text-primary`
(backed by `--gsl-primary`), `rounded-xl` (backed by `--gsl-radius-xl`), and Card's
`--gsl-card-padding`. Prefer these over hardcoded colors or spacing values.
