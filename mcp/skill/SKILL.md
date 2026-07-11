---
name: rfdtech-ui
description: Use before building or modifying UI with @rfdtech/components — search the component index, pull authoritative types and examples, and follow design rules instead of inventing APIs or styles.
---

Before generating or editing UI code that uses `@rfdtech/components`:

1. **Search first.** Call `search_components` (or `search_docs`) with the feature you're building
   ("date range filter", "confirmation dialog", "wizard") before writing any markup — a component
   for it may already exist.
2. **Never invent props or types.** Call `get_component_types` (or `get_component`) and use the
   real prop names, variants, and types straight from `src/types/<slug>.ts` — do not guess from
   memory or from a component's visual appearance. MDX prop tables are prose and can go stale;
   the type source is authoritative.
3. **Read real examples.** Call `get_component_examples` before composing a non-trivial usage
   (tables, forms in modals, async flows) — every known example is included, not just the ones
   the doc page happens to show inline.
4. **Follow the rules.** Call `get_rules` (whole corpus, a category like `forms`/`theming`, or a
   component slug) and follow its do/don't guidance — these are real conventions pulled from a
   production consumer of this library, not generic advice.
5. **Prefer composition over new components.** If an existing component covers most of the need,
   compose or extend it (`classNames`, slots, wrapping) rather than hand-rolling a replacement.
