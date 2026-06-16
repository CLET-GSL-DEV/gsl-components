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

## Commit message style

```
feat: add {ComponentName} component with {key features}; update CHANGELOG and navigation

feat: add Button component with variants, loading state, and documentation; update README and changelog
feat: add OtpInput component with configurable length, keyboard navigation, paste support, and forwardRef for react-hook-form; update CHANGELOG, README, and navigation
feat: introduce Dialog component with compound primitives and documentation; update CHANGELOG and navigation for new Dialog section
chore: update CHANGELOG for version 1.8.0; document changes including new Form and Draggable components...
```

- `feat:` for new components/features
- `chore:` for changelog bumps, housekeeping
- `refactor:` for code changes without new features
- `fix:` for bug fixes

## Testing

- Vitest + `@testing-library/react` + `@testing-library/user-event`
- Test file: `src/components/{name}/{Name}.test.tsx`
- Cover: forwardRef, invalid styling, disabled, key interactions (typing, paste, keyboard nav, onChange)

## Git rules

- **Never push to GitHub unless explicitly asked.** Stage and commit locally, but wait for confirmation before pushing.

## Useful patterns

- **OTP paste from any slot**: paste handler takes `(index, event)` and fills `newDigits[index + i]`
- **onComplete**: fires when `joined.length === length` — useful for auto-submit after full entry
- **Container blur**: use `containerRef.current?.contains(e.relatedTarget)` to detect if focus left the whole component
- **Rest props spread**: destructure known props, spread `...props` onto root element for `aria-*`, `id`, `data-*` passthrough
- **Inline styles in examples**: common for labeling grouped variants — `<p style={{ margin: 0, fontSize: 14, color: "var(--gsl-text-secondary)" }}>`
- **Omit describing what the component inherently is**: don't say "multi-slot" for OTP, don't say "digit slots" — the component name says it already
