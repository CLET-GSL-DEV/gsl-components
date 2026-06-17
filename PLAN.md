# Plan: Dialog Compound Parts + DateSelector

## 1. Dialog — Add Header, Body, Footer

### Why
Modal has `ModalHeader`/`ModalBody`/`ModalFooter`. Dialog doesn't.
Consumers hit this:
```tsx
<DialogContent>
  <DialogTitle>...</DialogTitle>
  <DialogDescription>...</DialogDescription>
  {/* raw div soup for body */}
  {/* raw div soup for footer */}
</DialogContent>
```
Adding the three compound parts makes Dialog structurally match Modal
without forcing users to switch to Modal when they just want structure.

### What stays unchanged (zero breaking)
- `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose` — untouched
- `DialogOverlay` — untouched
- `DialogContent` — untouched, still accepts raw children
- `DialogTitle`, `DialogDescription` — untouched

All existing code continues to work. New parts are purely additive.

### New exports

```tsx
// DialogHeader — wraps title + description, provides a border-bottom
export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-dialog__header", classNames?.header, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

// DialogBody — scrollable content region
export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  function DialogBody({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-dialog__body", classNames?.body, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

// DialogFooter — action row, right-aligned, border-top
export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("gsl-dialog__footer", classNames?.footer, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
```

### CSS additions (appended to `styles/dialog.css`)

```css
.gsl-dialog__header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gsl-border);
}

.gsl-dialog__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* padding handled by parent .gsl-dialog__content */
  margin: 0 -24px; /* negate parent padding so body fills edge-to-edge */
  padding: 0 24px;
}

.gsl-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--gsl-border);
}
```

**Why this works with existing DialogContent:**  
`.gsl-dialog__content` is already `display: flex; flex-direction: column; gap: 16px;`.
Header, Body, Footer slot into that flex layout naturally.
Without them, nothing changes — the gap still works for raw children.

### Type additions (`types/dialog.ts`)

```ts
export interface DialogHeaderClassNames {
  header?: string;
}
export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: DialogHeaderClassNames;
}

export interface DialogBodyClassNames {
  body?: string;
}
export interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: DialogBodyClassNames;
}

export interface DialogFooterClassNames {
  footer?: string;
}
export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: DialogFooterClassNames;
}
```

### Usage contrast

**Before (no structure):**
```tsx
<DialogContent>
  <DialogTitle>Delete account</DialogTitle>
  <DialogDescription>This action cannot be undone.</DialogDescription>
  <div style={{ flex: 1 }}>...content...</div>
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
    <Button variant="error">Delete</Button>
  </div>
</DialogContent>
```

**After:**
```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Delete account</DialogTitle>
    <DialogDescription>This action cannot be undone.</DialogDescription>
  </DialogHeader>
  <DialogBody>...content...</DialogBody>
  <DialogFooter>
    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
    <Button variant="error">Delete</Button>
  </DialogFooter>
</DialogContent>
```

### Files touched

| File | Action |
|------|--------|
| `src/components/dialog/Dialog.tsx` | Add `DialogHeader`, `DialogBody`, `DialogFooter` exports |
| `src/components/dialog/index.ts` | Re-export new components + types |
| `src/types/dialog.ts` | Add type interfaces |
| `src/components/dialog/styles/dialog.css` | Append header/body/footer rules |

---

## 2. Popover — Leave alone

Popover is intentionally lightweight (29 lines). It wraps Radix Popover with one styled
`PopoverContent`. That's its job.

- **No `PopoverArrow`** — Radix arrow requires `width/height` on the SVG, fights with
  border colors, and adds layout complexity consumers don't need for dropdowns, tooltips,
  or command menus.
- **No `PopoverClose`** — Radix already exports `PopoverPrimitive.Close`. Consumers can
  use it directly if needed.
- **No `PopoverHeader`/`PopoverFooter`** — Popover isn't a dialog. It's a floating panel.
  Structure belongs at the consumer level.

No changes.

---

## 3. DateSelector — Proper calendar (secondary)

Current state: styled `<input type="date">`. No calendar popover.
This is a bigger lift. Defer until Dialog compound parts land.

Approach when we do it:
- Use native `Date` arithmetic (no date lib, per project rules)
- Custom calendar grid component
- Month/year navigation via `<` `>` buttons
- Follow the same `forwardRef` + `classNames` + `invalid`/`disabled` pattern
- Expose `DateSelector`, `DateSelectorCalendar`, `DateSelectorTrigger` as compound components

---

## 4. NetworkOperator — Not a stub

NetworkOperator is a fully custom dropdown (97 lines) with search, selection,
`invalid`/`disabled` states, and a configurable `options` array with Ghana defaults.
No changes needed.

---

## Execution order

1. Dialog compound parts (header/body/footer) — types, component, CSS, index
2. DateSelector calendar (deferred, separate PR)
