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
export const Example = forwardRef<HTMLInputElement, ExampleProps>(
  function Example(
    { invalid = false, disabled = false, classNames, className, ...props },
    ref,
  ) {
    return (
      <div
        aria-invalid={invalid || undefined}
        className={cn(
          "gsl-example",
          invalid && "gsl-example--invalid",
          classNames?.root,
          className,
        )}
        {...props}
      >
        ...
      </div>
    );
  },
);
```

- `invalid` → error border + `aria-invalid`
- `disabled` → gray out, `cursor: not-allowed`, no interaction
- `classNames?.{part}` → merged via `cn()` after base `gsl-*` class
- `className` → merged onto root (same effect as `classNames.root`)

### RHF integration

RHF is **not** baked into any input component. Integration is entirely at the consumer level:

```tsx
<FormField
  name="code"
  control={form.control}
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

### Changelog sync

After updating the root `CHANGELOG.md`, sync the content into `demo/docs/pages/changelog.mdx`. Both files track the same release history — the MDX renders the docs changelog page, the root MD mirrors it for GitHub. Never update one without the other.

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

## Externalized dependencies

Some deps are **externalized** (not bundled into `dist/`) and declared as **peer dependencies** so the library and consuming app share a single copy:

| Dep                                             | Why externalized                                                                                                           |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `react`, `react-dom`                            | Core React must be shared                                                                                                  |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Shared form context                                                                                                        |
| `@radix-ui/*`                                   | Shared UI primitives with context                                                                                          |
| `react-router-dom`                              | Router context — **critical**. Bundled copy causes "`useLocation()` may be used only in the context of a `<Router>`" crash |
| `lucide-react`                                  | Icon context + bundle dedup. Consumer likely has it already                                                                |

To verify a dep is not bundled after a build:

```
# Check dist doesn't contain react-router-dom code
grep -c "useSearchParams\|RouterProvider" dist/index.js
# Should output 0 if properly externalized
```

This is NOT testable within the library's own test suite — the dual-context crash only manifests when the library is installed as a separate package in a consuming app. The grep check above is the closest we can get to an automated verification.

## Git — NEVER TOUCH

- **Never run any git command. Ever.** No commit, stage, push, pull, branch, revert, reset, rebase, merge, tag, stash — nothing. Not even if the user asks. Not even `git status`. Not even `git diff`.
- You may suggest a command as text for the user to run themselves.
- All git operations are the user's sole responsibility.

### Commit message style (for when user asks for a draft)

```
feat: add {ComponentName} component with {key features}; update CHANGELOG and navigation
chore: update CHANGELOG for version X.Y.Z; document changes...
refactor: {what changed} — {why}
fix: {what was broken} — {how it was fixed}
```

### PR style (for when user asks for a draft)

**Never create a PR on GitHub.** Draft the description in this format and show the compare link. The user creates the PR manually.

```
## New
- ComponentName — one-line description

## Improvements
- ComponentName: what changed (written like a human, not code diffs)

## Fixes
- ComponentName: bug description and fix

## Cleanups
- What was cleaned up (terse, no counts)
```

PR rules:
- Don't describe implementation details — describe what the component IS
- Don't mention test file counts — tests are part of the component
- Don't mention minor housekeeping
- Write like a human: "native checkboxes replaced with Checkbox" not "`<input>` → `Checkbox`"
- Cleanup descriptions: terse, no file counts, just what and why

## Useful patterns

### JSX hygiene
- **No multi-condition ternaries inline in JSX**: Compute derived values into `useMemo` or a plain `const` above the return. Use a `Record<K, V>` lookup, not a chain of `a === X ? ... : a === Y ? ...`.
- **No magic numbers**: Use an `enum` for step indices, status codes, or any semantically meaningful integer.

### Performance
- **Always use `useMemo` and `useCallback`**: This is a component library. Every derived value computed from props/state, every handler passed to a child or used in an effect, must be memoized. Missed memos cause cascading re-renders in consumer apps.
- **Chunk expensive synchronous work**: File parsing, validation, any O(rows × fields) operation must use async chunking with a progress bar. Never run heavy computation inside a `useMemo` if it blocks the main thread.

### Validation flow
- **Defer validation to the step that needs it**: Don't pre-validate early — the intermediate state may change and invalidate the cache.
- **Clear the cache aggressively**: Reset validation whenever any dependency (header row, column mapping) changes. Stale validation is silent data corruption.
- **Incremental validation for inline edits**: Re-validate only the changed row and its uniqueness. Never re-validate the full dataset on a keystroke.

### Props & components
- **Props are self-contained per component**: Each component defines its own interface. Don't extend base props interfaces. Don't use `[key: string]: unknown`.
- **`forwardRef` on all input-like components**: Required for RHF `{...field}` integration.
- **`classNames` sub-object for internal elements**: `classNames?.{part}` merged via `cn()` after the base `gsl-*` class. `className` on root = `classNames.root`.

### Styling
- BEM naming: `gsl-component`, `gsl-component__part`, `gsl-component--modifier`
- **No inline styles**. Use CSS classes. Inline `style={{}}` objects are only acceptable when a value is genuinely dynamic (computed from JS at runtime, e.g. `transform: translateY(${item.start}px)`). Static style properties — position, width, fontSize, padding, colors — belong in CSS files. Never pass a static style object into JSX.
- CSS imported in the component file. No CSS-in-JS.
- Only `--gsl-*` tokens. No hardcoded colors.
- `invalid` → `aria-invalid` + error border. `disabled` → `cursor: not-allowed` + no interaction. Standard 40px height, border-radius `--gsl-radius`, etc.

### Misc patterns
- OTP paste from any slot: handler takes `(index, event)`, fills `newDigits[index + i]`
- `onComplete`: fires when `joined.length === length`
- Container blur: `containerRef.current?.contains(e.relatedTarget)`
- Rest props spread: destructure known, spread `...props` on root for `aria-*`, `id`, `data-*`
- Inline styles in examples: ok for labeling grouped variants
- Don't describe what the component inherently is in docs

## NO HALLUCINATED PROPS

When documenting components, read the actual type definitions from `src/types/*.ts`. Never invent or assume props. If a prop exists in docs but not in the type file, remove it. If you can't find the type file, ask.

## Testing

- State the existing test cases for the component.
- Propose gaps or missing scenarios to the user.
- Only add tests the user explicitly approves.
- Cover: forwardRef, invalid styling, disabled state, key interactions (typing, paste, keyboard nav, onChange).
