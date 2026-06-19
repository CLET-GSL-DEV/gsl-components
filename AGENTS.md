# GSL Components — Agent Knowledge

References: [`.cursor/rules/gsl-component-authoring.mdc`](.cursor/rules/gsl-component-authoring.mdc) — always consult first.

---

## Codebase facts

- **Framework**: React 19 + TypeScript 5.8 + Vite + Vitest
- **Package**: `@rfdtech/components` — shared component library
- **Entry**: `src/index.ts` — imports `theme.css`, re-exports all components
- **Demo**: `npm run demo` uses `vite.demo.config.ts`, aliases `@rfdtech/components` → `src/index.ts`
- **Available Radix deps**: `@radix-ui/react-popover`, `@radix-ui/react-select`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-radio-group`, `@radix-ui/react-alert-dialog`
- **Other deps**: `lucide-react`, `cmdk`, `sonner`, `@dnd-kit/*`
- **CSS-in-JS**: None. Plain CSS files imported in components via Vite.

## No new dependencies

**Do NOT add new npm packages.** The project avoids dependency bloat. Use native APIs, existing Radix primitives, or lucide-react for icons. Date formatting uses `Date.toLocaleDateString()`, calendar grids use native `Date` arithmetic.

## No emojis

**NEVER use emoji characters in any code, docs, examples, or MDX pages.** The only exception is country flag emojis (e.g. in `CountrySelector`). Everywhere else — icons, examples, docs, comments, commit messages — use lucide-react icons, inline SVGs, or plain text. No 🚀, no ✅, no 📊, no ⚙️, no none of that shit.

## Component architecture

Every input-like component follows this pattern:

### Props

```ts
export interface ExampleClassNames {
  root?: string;
}

export interface ExampleProps {
  invalid?: boolean;
  disabled?: boolean;
  classNames?: ExampleClassNames;
  className?: string;
}
```

Props are **self-contained** — each component defines its own interface. Do NOT extend `BaseInputProps`. Do NOT use `[key: string]: unknown` (causes TS issues with rest spreads). Extend `HTMLAttributes<HTMLDivElement>` with `Omit` for clashing keys like `onChange`.

### Component

```tsx
export const Example = forwardRef<HTMLInputElement, ExampleProps>(function Example(
  { invalid = false, disabled = false, classNames, className, ...props },
  ref,
) {
  return (
    <div
      aria-invalid={invalid || undefined}
      className={cn("gsl-example", invalid && "gsl-example--invalid", classNames?.root, className)}
      {...props}
    >
      ...
    </div>
  );
});
```

- `invalid` → error border + `aria-invalid`
- `disabled` → gray out, `cursor: not-allowed`, no interaction
- `classNames?.{part}` → merged via `cn()` after base `gsl-*` class
- `className` → merged onto root (same effect as `classNames.root`)

### RHF integration

RHF is **not** baked into any input component. Integration is entirely at the consumer level:

```tsx
<FormField name="code" control={form.control}
  render={({ field, fieldState }) => (
    <Field invalid={!!fieldState.error}>
      <FieldControl>
        <OtpInput {...field} />
      </FieldControl>
      <FieldError />
    </Field>
  )}
/>
```

`{...field}` provides `{ onChange, onBlur, value, name, ref }`. The input must use `forwardRef` for this to work. `FieldControl` uses `Slot` to inject `aria-invalid`, `id`, `aria-describedby` into the child.

## Styling

- **Tokens**: `--gsl-bg`, `--gsl-text`, `--gsl-text-secondary`, `--gsl-border`, `--gsl-border-strong`, `--gsl-hover`, `--gsl-primary`, `--gsl-primary-light`, `--gsl-error`, `--gsl-radius`, `--gsl-font`, `--gsl-z-popover`, `--gsl-z-select`, `--gsl-shadow-sm/md/lg`, `--gsl-overlay`
- **No hardcoded colors**. Only `--gsl-*` tokens.
- **BEM naming**: `gsl-component`, `gsl-component__part`, `gsl-component--modifier`
- **CSS imported in the component file**: `import "./styles/example.css"`
- **Input standard look**: 40px height, 0 12px padding, `var(--gsl-border)` 1px solid, `var(--gsl-radius)` border-radius, 14px font
- **Focus**: `outline: none; border-color: var(--gsl-primary); box-shadow: 0 0 0 1px var(--gsl-primary)`
- **Disabled**: `background-color: var(--gsl-hover); color: var(--gsl-text-muted); cursor: not-allowed`
- **Invalid**: `border-color: var(--gsl-error)` + same for focus shadow
- **Reduced motion**: `@media (prefers-reduced-motion: reduce) { transition: none; }`

## Module layout

Per `.cursor/rules/gsl-component-authoring.mdc`:

```
src/components/{name}/
  {Name}.tsx
  index.ts
  styles/{name}.css
  {Name}.test.tsx
src/types/{name}.ts
```

## Documentation

### Example (single source of truth)
1. `demo/docs/previews/examples/{name}.example.tsx` — runnable component, exports named function
2. `demo/docs/previews/code/{Name}Preview.tsx` — imports example, renders it (no extra logic)
3. `.mdx` imports preview + `?raw` source, passes to `<ExampleTabs>`

### MDX page structure
```
export const meta = { title, description }

imports

# ComponentName
one-paragraph description

## Example
<ExampleTabs title="..." preview={<... />} code={source} />

## Props
| Prop | Type | Default | Description |

## Types
### ComponentProps
description
### ComponentClassNames
| Key | Applied to |

## Notes
- bullet list
```

### Nav entry
`demo/docs/nav.ts` — alphabetical by `slug` in Components section.

### README entry
Alphabetical by `##` section title. One-liner + code block + `Props: ... Exported types: ...`

## Testing

- Vitest + `@testing-library/react` + `@testing-library/user-event`
- Test file: `src/components/{name}/{Name}.test.tsx`
- Cover: forwardRef, invalid styling, disabled, key interactions (typing, paste, keyboard nav, onChange)

## Before PR checklist

Before creating a pull request, run the full validation pipeline to catch issues early:

```
npm run lint:css && npm run lint && npm run typecheck && npm run test && npm run build
```

(Or the equivalent `bun run` commands.) This mirrors `prepublishOnly` and ensures nothing slips through.

## Externalized dependencies

Some deps are **externalized** (not bundled into `dist/`) and declared as **peer dependencies** so the library and consuming app share a single copy:

| Dep | Why externalized |
|---|---|
| `react`, `react-dom` | Core React must be shared |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Shared form context |
| `@radix-ui/*` | Shared UI primitives with context |
| `react-router-dom` | Router context — **critical**. Bundled copy causes "`useLocation()` may be used only in the context of a `<Router>`" crash |
| `lucide-react` | Icon context + bundle dedup. Consumer likely has it already |

To verify a dep is not bundled after a build:
```
# Check dist doesn't contain react-router-dom code
grep -c "useSearchParams\|RouterProvider" dist/index.js
# Should output 0 if properly externalized
```

This is NOT testable within the library's own test suite — the dual-context crash only manifests when the library is installed as a separate package in a consuming app. The grep check above is the closest we can get to an automated verification.

## Git rules

- **NEVER PUSH TO MAIN. EVER. OR ELSE.**
- **Never push to GitHub unless explicitly asked.** Stage and commit locally, but wait for confirmation before pushing.
- When pushing is explicitly requested, push to a feature branch or the current working branch — never main.
- **Never auto-commit.** After completing an action, ask whether to commit. Do not commit blindly.
- **Always recommend a commit message** — show the proposed message and get approval before committing.
- **Before any git operation**, re-read this section to confirm you're following all rules.

### Commit message style

```
feat: add {ComponentName} component with {key features}; update CHANGELOG and navigation
chore: update CHANGELOG for version X.Y.Z; document changes...
refactor: {what changed} — {why}
fix: {what was broken} — {how it was fixed}
```

### PR style

**Never create a PR on GitHub.** When asked for a PR, only draft the description in the format below and show the compare link (`https://github.com/RFD-TECH/gsl-components/compare/main...{branch}`). The user creates the PR manually.

When drafting a PR, categorize changes under these headings (in this order):

```
## New
- ComponentName — one-line description

## Improvements
- ComponentName: what changed (written like a human, not code diffs)

## Fixes
- ComponentName: bug description and fix

## Cleanups
- What was cleaned up (terse, no counts like "89 files")
```

Rules:
- Don't describe implementation details like "single trigger display" or "via CSS" — describe what the component IS
- Don't mention test file counts in PRs — tests are part of the component they test
- Don't mention minor housekeeping like "demo modals now have close buttons"
- Write like a human: "native checkboxes replaced with Checkbox" not "native `<input type="checkbox">` → `Checkbox`"
- Cleanup descriptions: terse, no file counts, just what and why

## Useful patterns

- **OTP paste from any slot**: paste handler takes `(index, event)` and fills `newDigits[index + i]`
- **onComplete**: fires when `joined.length === length` — useful for auto-submit after full entry
- **Container blur**: use `containerRef.current?.contains(e.relatedTarget)` to detect if focus left the whole component
- **Rest props spread**: destructure known props, spread `...props` onto root element for `aria-*`, `id`, `data-*` passthrough
- **Inline styles in examples**: common for labeling grouped variants — `<p style={{ margin: 0, fontSize: 14, color: "var(--gsl-text-secondary)" }}>`
- **Omit describing what the component inherently is**: don't say "multi-slot" for OTP, don't say "digit slots" — the component name says it already

## NO HALLUCINATED PROPS

When documenting components, read the actual type definitions from src/types/*.ts. Never invent or assume props. If a prop exists in docs but not in the type file, remove it. If you can't find the type file, ask.
