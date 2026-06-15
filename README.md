# GSL Components

Shared React component library for Ghana School of Law (GSL) projects.

Requires React 18+ and a bundler that processes CSS (Vite, Webpack, etc.).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## Styles

Component styles load automatically when you import from `@rfdtech/components` (the JS bundle includes `import './index.css'`). For reliable styling in production, add this once in your app entry (`main.tsx` or `App.tsx`):

```ts
import "@rfdtech/components/style.css";
```

After upgrading the package, clear Vite's dependency cache if styles look stale: `rm -rf node_modules/.vite`.

## Shared theming

Wrap your app in `ThemeProvider` for light, dark, and system themes. Design tokens live in [`src/styles/theme.css`](src/styles/theme.css) and apply to `.gsl-theme`, `document.documentElement`, and all components (including portaled modals and popovers).

```tsx
import { ThemeProvider } from "@rfdtech/components";
import "@rfdtech/components/style.css";

<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

Use `useTheme()` to read or change the active theme at runtime. See the [Theme](/docs/theme) docs page for token reference and controlled mode.

| Token | Light default | Use |
|-------|---------------|-----|
| `--gsl-primary` | `#dc2626` | Buttons, focus rings, accents |
| `--gsl-primary-light` | `#fef2f2` | Selected rows, hover fills |
| `--gsl-bg` | `#ffffff` | Surfaces |
| `--gsl-text` | `#3c4043` | Body text |
| `--gsl-text-secondary` | `#5f6368` | Labels, muted UI |
| `--gsl-border` | `#dadce0` | Borders |
| `--gsl-hover` | `#f1f3f4` | Row/cell hover |
| `--gsl-error` / `--gsl-error-bg` | `#dc2626` / `#fef2f2` | Errors |
| `--gsl-success` | `#16a34a` | Success states |
| `--gsl-warning` | `#eab308` | Warnings |

You can still override tokens on any ancestor without `ThemeProvider`:

```css
.my-app {
  --gsl-primary: #1d4ed8;
  --gsl-primary-light: #eff6ff;
}
```

`BulkImportModal` also accepts legacy aliases (`--gsl-bulk-import-primary`, etc.) that map to the shared tokens.

## Install

```bash
npm install @rfdtech/components
```

Requires React 18+. npm 7+ auto-installs `react` and `react-dom` as peer dependencies. Radix UI and other runtime packages are included as dependencies of `@rfdtech/components`.


## Hooks

Shared hooks for URL-driven overlay state and router integration. See the [Hooks](/docs/hooks) docs page for full API reference.

```tsx
import {
  Dialog,
  DialogContent,
  useDialogSearchParam,
  useModalSearchParam,
} from "@rfdtech/components";

const { open, data, onOpenChange, openWith } = useDialogSearchParam<{
  userId: string;
}>("edit-profile");

openWith({ userId: "42" });

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>Edit user {data?.userId}</DialogContent>
</Dialog>
```

Exports: `useSearchParamOverlay`, `useDialogSearchParam`, `useModalSearchParam`, `createSearchParamAdapter`, `createBrowserSearchParamAdapter`, `readOverlayData`, `writeOverlayData`, `clearOverlayData`, `getDataPrefix`. Types: `SearchParamOverlayState`, `SearchParamOverlayData`, `SearchParamAdapter`, `UseSearchParamOverlayOptions`, `UseSearchParamOverlayReturn`.


## AppSwitcher

Google Apps–style 9-dot launcher for switching between GSL systems. Drop it into your header to let users jump between products. Pass `apps` directly from your own data layer; use `loading` while data is being fetched.

See the [AppSwitcher](/docs/app-switcher) docs page for props and exported types.

```tsx
import { AppSwitcher, type AppItem } from "@rfdtech/components";

function Header({ apps, loading }: { apps: AppItem[]; loading: boolean }) {
  return (
    <AppSwitcher
      apps={apps}
      loading={loading}
      title="System directory"
      onAppSelect={(app) => console.log(app.name)}
    />
  );
}
```

Props: `apps`, `loading`, `loadingLabel`, `columns`, `open`, `onOpenChange`, `onAppSelect`, `triggerLabel`, `trigger`, `title`, `footer`, `placement`, `closeOnSelect`, `className`, `style`. Exported types: `AppSwitcherProps`, `AppItem`, `UseAppSwitcherOptions`, `UseAppSwitcherReturn`.

Also exported: `AppSwitcherItem`, `GridIcon`, `SystemAppIcon`, `useAppSwitcher`.


## Badge

Compact inline label for status, counts, and metadata with semantic color variants. See the [Badge](/docs/badge) docs page for props and exported types.

```tsx
import { Badge } from "@rfdtech/components";

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="outline" size="md">
  Draft
</Badge>
```

Props: `variant`, `size`, `classNames`, `className`, and standard `span` attributes. Exported types: `BadgeProps`, `BadgeClassNames`, `BadgeVariant`, `BadgeSize`.


## Breadcrumb

Compound breadcrumb primitives for hierarchical page trails. See the [Breadcrumb](/docs/breadcrumb) docs page for props and exported types.

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@rfdtech/components";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Profile</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

Exported parts: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`. Exported types: `BreadcrumbProps`, `BreadcrumbLinkProps`, `BreadcrumbPageProps`, and related `*ClassNames` interfaces.


## BulkImportModal

Four-step modal wizard for importing spreadsheet data (.xlsx, .xls, .csv). Parsing and validation run entirely in the browser.

### Usage

```tsx
import { BulkImportModal, useModalSearchParam } from "@rfdtech/components";

const fields = [
  { key: "email", label: "Email", required: true },
  { key: "full_name", label: "Full name", required: true },
  { key: "student_id", label: "Student ID" },
];

const { open, onOpenChange, openWith } = useModalSearchParam("bulk-import");

<button type="button" onClick={() => openWith()}>Import students</button>

<BulkImportModal
  open={open}
  onOpenChange={onOpenChange}
  title="Import students"
  fields={fields}
  onComplete={(result) => {
    console.log(result.rows, result.errors);
    onOpenChange(false);
  }}
/>
```

### Steps

1. **Upload Document** — preview expected columns, then upload `.xlsx`, `.xls`, or `.csv`
2. **Select header row** — choose the header row with radio buttons
3. **Match Columns** — map each uploaded column to a target field (`Your table` → `Will become`)
4. **Validate data** — review rows in a table, discard invalid rows, then **Confirm**

The first worksheet is used for multi-sheet workbooks. Discarded rows are excluded from `onComplete`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | required | Open state callback |
| `fields` | `BulkImportField[]` | required | Target field schema for column matching |
| `onComplete` | `(result: BulkImportResult) => void` | required | Called with mapped rows on import |
| `title` | `string` | `"Bulk import"` | Modal title |
| `maxFileSizeBytes` | `number` | `5242880` | Maximum upload size (5 MB) |
| `allowImportWithWarnings` | `boolean` | `false` | Allow import when only warnings exist |
| `className` | `string` | — | Root CSS class |

### Field schema

Each item in `fields` defines how a column is matched and validated:

```ts
type BulkImportFieldType =
  | "string"
  | "email"
  | "number"
  | "integer"
  | "date"
  | "boolean"
  | "url"
  | "phone";

interface BulkImportField {
  key: string;
  label: string;
  required?: boolean;
  type?: BulkImportFieldType;
  pattern?: string | RegExp;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  optionsIgnoreCase?: boolean;
  optionsMessage?: string;
  description?: string;
  example?: string;
  trim?: boolean;
  validate?: (value: string) => string | null;
}
```

Example:

```tsx
const fields = [
  {
    key: "email",
    label: "Email",
    required: true,
    type: "email",
    description: "Student email address",
    example: "student@gsl.edu.gh",
  },
  {
    key: "student_id",
    label: "Student ID",
    pattern: "^STU-\\d{4}$",
    patternMessage: "Use format STU-1234",
    example: "STU-0042",
  },
  {
    key: "status",
    label: "Status",
    options: ["active", "inactive"],
  },
];
```

Schema rules run before any custom `validate` function. Step 1 uses `example` when set; otherwise it derives preview values from `options`, `type`, `min`, and `patternMessage`. Step 3 maps each uploaded column to a target field and supports excluding columns with **×**.

### Types

```ts
interface BulkImportResult {
  rows: Record<string, string>[];
  errors: BulkImportValidationError[];
  warnings: BulkImportValidationError[];
}
```

Also exported: `useBulkImportFlow`, step components, and utilities (`parseSpreadsheetFile`, `mapRowsToRecords`, `validateMappedRows`, `validateFieldValue`, `getFieldExampleValue`, `getFieldHint`, `autoMatchSourceColumns`).

### Theming

The modal uses a **near full-viewport** layout with a compulsory gutter on all sides (24px desktop, 16px mobile), enforced by overlay padding. Override shared tokens on `.gsl-bulk-import` via the `className` prop (see [Shared theming](#shared-theming)):

```css
.my-import {
  --gsl-primary: #dc2626;
  --gsl-primary-light: #fef2f2;
  --gsl-success: #16a34a;
  --gsl-error-bg: #fef2f2;
}
```

Legacy aliases (`--gsl-bulk-import-primary`, `--gsl-bulk-import-primary-light`, etc.) still work and map to the shared tokens.

To change the gutter size, override `--gsl-bulk-import-gutter` on `.gsl-bulk-import__overlay` in your app CSS (do not override modal width/height — the dialog always fills the padded overlay area):

```css
.gsl-bulk-import__overlay {
  --gsl-bulk-import-gutter: 32px;
}
```


## Button

Shared button with primary, secondary, outline, and ghost variants, plus loading and disabled states. See the [Button](/docs/button) docs page for props and exported types.

```tsx
import { Button } from "@rfdtech/components";

<Button variant="primary" onClick={() => save()}>
  Save
</Button>

<Button loading loadingLabel="Saving">
  Save
</Button>

<Button disabled>Unavailable</Button>

<Button
  variant="outline"
  classNames={{ root: "min-w-32", label: "font-semibold" }}
>
  Custom
</Button>
```

Props: `variant`, `size`, `loading`, `loadingLabel`, `classNames`, and standard `button` attributes. Exported types: `ButtonProps`, `ButtonClassNames`, `ButtonVariant`, `ButtonSize`.


## Checkbox

Accessible checkbox with optional label and part-level `classNames`. See the [Checkbox](/docs/checkbox) docs page for props and exported types.

```tsx
import { Checkbox } from "@rfdtech/components";

<Checkbox
  label="Accept terms and conditions"
  checked={accepted}
  onCheckedChange={setAccepted}
/>

<Checkbox
  aria-label="Select row"
  checked={selected}
  onCheckedChange={setSelected}
/>
```

Props: `checked`, `defaultChecked`, `onCheckedChange`, `label`, `disabled`, `required`, `name`, `value`, `id`, `aria-label`, `classNames`, `className`. Exported types: `CheckboxProps`, `CheckboxClassNames`.


## Command

Compound command menu primitives for searchable, keyboard-navigable action lists. Supports inline pickers and modal palettes via `CommandDialog`. See the [Command](/docs/command) docs page for props and exported types.

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  useDialogSearchParam,
} from "@rfdtech/components";

<Command label="Field picker">
  <CommandInput placeholder="Search fields..." />
  <CommandList>
    <CommandEmpty>No results.</CommandEmpty>
    <CommandGroup heading="Fields">
      <CommandItem value="email" onSelect={() => setField("email")}>
        Email
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>

const { open, onOpenChange, openWith } = useDialogSearchParam("command-menu");

<Button onClick={() => openWith()}>Open command menu</Button>

<CommandDialog open={open} onOpenChange={onOpenChange} shortcut label="Command menu">
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandItem onSelect={() => go("/dashboard")}>Dashboard</CommandItem>
    <CommandItem onSelect={signOut}>
      Sign out
      <CommandShortcut><span>⌘</span><span>Q</span></CommandShortcut>
    </CommandItem>
  </CommandList>
</CommandDialog>
```

Exports: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandLoading`, `CommandShortcut`, `useCommandShortcut`. Exported types: `CommandProps`, `CommandDialogProps`, `CommandItemProps`, `CommandShortcutProps`, `UseCommandShortcutOptions`, and related `*ClassNames` types.


## RadioGroup

Single-choice radio group with optional labels and descriptions on each `Radio` item. Use `variant="card"` for bordered choice cards. See the [RadioGroup](/docs/radio-group) docs page for props and exported types.

```tsx
import { Radio, RadioGroup } from "@rfdtech/components";

<RadioGroup variant="card" value={plan} onValueChange={setPlan}>
  <Radio
    value="starter"
    label="Starter"
    description="For individuals getting started."
  />
  <Radio
    value="team"
    label="Team"
    description="Collaborate with up to 10 members."
  />
</RadioGroup>
```

Props: `RadioGroup` — `value`, `defaultValue`, `onValueChange`, `name`, `disabled`, `required`, `orientation`, `variant`, `classNames`, `className`, `children`. `Radio` — `value`, `label`, `description`, `disabled`, `id`, `aria-label`, `classNames`, `className`. Exported types: `RadioGroupProps`, `RadioProps`, `RadioGroupClassNames`, `RadioClassNames`, `RadioGroupVariant`.


## Dropdown

Select-style dropdown for choosing one option from a list. See the [Dropdown](/docs/dropdown) docs page for props and exported types.

```tsx
import { Dropdown } from "@rfdtech/components";

<Dropdown
  aria-label="Field"
  value={value}
  onValueChange={setValue}
  options={[
    { value: "email", label: "Email" },
    { value: "name", label: "Full name" },
  ]}
  placeholder="Select..."
  clearable
/>
```

Props: `value`, `onValueChange`, `options`, `placeholder`, `clearable`, `disabled`, `aria-label`, `classNames`, `className`. Exported types: `DropdownProps`, `DropdownOption`, `DropdownClassNames`.


## Form

Field, Input, and Textarea primitives for accessible form layouts. See the [Form](/docs/form) docs page for props and exported types.

```tsx
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Input,
  Textarea,
} from "@rfdtech/components";

<Field>
  <FieldLabel>Email</FieldLabel>
  <FieldControl>
    <Input type="email" placeholder="you@example.com" />
  </FieldControl>
  <FieldDescription>We will never share your email.</FieldDescription>
</Field>
```

Exports: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldControl`, `Input`, `Textarea`. Types: `FieldProps`, `FieldClassNames`, `InputProps`, `TextareaProps`.


## FormField

react-hook-form adapters with Zod validation support. See the [FormField](/docs/form-field) docs page for props and exported types.

```bash
npm install react-hook-form zod @hookform/resolvers
```

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Form,
  FormField,
  Input,
} from "@rfdtech/components";

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "" },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field, fieldState }) => (
        <Field invalid={!!fieldState.error}>
          <FieldLabel>Email</FieldLabel>
          <FieldControl>
            <Input type="email" {...field} />
          </FieldControl>
          <FieldError>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
    <Button type="submit">Save</Button>
  </form>
</Form>
```

Exports: `Form`, `FormField`, `useFormField`. Types: `FormProps`, `FormFieldProps`, `UseFormFieldReturn`.


## Dialog

Compound dialog primitives for modal overlays. See the [Dialog](/docs/dialog) docs page for props and exported types.

```tsx
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  useDialogSearchParam,
} from "@rfdtech/components";

const { open, data, onOpenChange, openWith } = useDialogSearchParam<{
  userId: string;
}>("edit-profile");

<Button variant="secondary" onClick={() => openWith({ userId: "42" })}>
  Edit profile
</Button>

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent showCloseButton>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes here. Editing user {data?.userId}.
      </DialogDescription>
    </DialogContent>
  </DialogPortal>
</Dialog>
```

Props: `Dialog` — `open`, `defaultOpen`, `onOpenChange`. `DialogContent` — `showCloseButton`, `classNames`, `className`. Styled parts also support part-level `classNames`. Exported types: `DialogOverlayProps`, `DialogContentProps`, `DialogTitleProps`, `DialogDescriptionProps`, and related `*ClassNames` interfaces.


## Draggable

Repositionable panel primitive with optional handle and bounded pointer dragging. See the [Draggable](/docs/draggable) docs page for props and exported types.

```tsx
import { Draggable, DraggableHandle } from "@rfdtech/components";

<div style={{ position: "relative", height: 240 }}>
  <Draggable defaultPosition={{ x: 24, y: 24 }} bounds="parent">
    <DraggableHandle aria-label="Drag card" />
    <div>Drag me</div>
  </Draggable>
</div>
```

Exports: `Draggable`, `DraggableHandle`, `useDraggable`, `clampPosition`. Types: `DraggableProps`, `DraggableHandleProps`, `DraggablePosition`, `DraggableBounds`, `DraggableAxis`, `UseDraggableOptions`, `UseDraggableReturn`.


## Modal

Compound modal primitives for near full-viewport overlays with header, body, and footer slots. See the [Modal](/docs/modal) docs page for props and exported types.

```tsx
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  useModalSearchParam,
} from "@rfdtech/components";

const { open, onOpenChange, openWith } = useModalSearchParam("review-changes");

<Button variant="secondary" onClick={() => openWith()}>
  Review changes
</Button>

<Modal open={open} onOpenChange={onOpenChange}>
  <ModalPortal>
    <ModalOverlay />
    <ModalContent showCloseButton>
      <ModalHeader>
        <ModalTitle>Review changes</ModalTitle>
        <ModalDescription>Confirm before publishing.</ModalDescription>
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={() => onOpenChange(false)}>Publish</Button>
      </ModalFooter>
    </ModalContent>
  </ModalPortal>
</Modal>
```

Props: `Modal` — `open`, `defaultOpen`, `onOpenChange`. `ModalContent` — `showCloseButton`, `classNames`, `className`. Layout parts (`ModalHeader`, `ModalBody`, `ModalFooter`) support part-level `classNames`. Exported types: `ModalOverlayProps`, `ModalContentProps`, `ModalHeaderProps`, `ModalTitleProps`, `ModalDescriptionProps`, `ModalBodyProps`, `ModalFooterProps`, and related `*ClassNames` interfaces.


## Popover

Compound popover primitives for floating panels. See the [Popover](/docs/popover) docs page for props and exported types.

```tsx
import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@rfdtech/components";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="secondary">Actions</Button>
  </PopoverTrigger>
  <PopoverContent
    side="bottom"
    align="end"
    sideOffset={4}
    className="gsl-popover--menu"
  >
    <div className="gsl-popover__menu" role="menu">
      <PopoverClose asChild>
        <button type="button" className="gsl-popover__menu-item" role="menuitem">
          Edit
        </button>
      </PopoverClose>
      <PopoverClose asChild>
        <button
          type="button"
          className="gsl-popover__menu-item gsl-popover__menu-item--destructive"
          role="menuitem"
        >
          Delete
        </button>
      </PopoverClose>
    </div>
  </PopoverContent>
</Popover>
```

Exports: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverPortal`, `PopoverAnchor`, `PopoverClose`. Exported types: `PopoverContentProps`, `PopoverContentClassNames`.


## ProgressBar

Accessible progress indicator for task completion and loading states. See the [ProgressBar](/docs/progress-bar) docs page for props and exported types.

```tsx
import { ProgressBar } from "@rfdtech/components";

<ProgressBar value={60} label="Upload progress" showValue />
<ProgressBar value={100} variant="success" />
<ProgressBar indeterminate label="Loading" size="md" />
```

Props: `value`, `max`, `variant`, `size`, `indeterminate`, `label`, `showValue`, `classNames`, `className`, and standard `div` attributes. Exported types: `ProgressBarProps`, `ProgressBarClassNames`, `ProgressBarVariant`, `ProgressBarSize`.


## Sidebar

Compound sidebar primitives for app shells and section navigation. Desktop uses a sticky card-style rail with optional collapse; mobile uses an offcanvas drawer with trigger and overlay. See the [Sidebar](/docs/sidebar) docs page for props and exported types.

```tsx
import {
  Sidebar,
  SidebarCollapse,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarOverlay,
  SidebarProvider,
  SidebarTrigger,
} from "@rfdtech/components";

<SidebarProvider>
  <SidebarTrigger>Open menu</SidebarTrigger>
  <SidebarOverlay />
  <Sidebar>
    <SidebarHeader>
      <div className="gsl-sidebar__header-brand">
        <span className="gsl-sidebar__header-title">GSL Admin</span>
      </div>
      <SidebarCollapse />
    </SidebarHeader>
    <SidebarContent>
      <SidebarNav aria-label="Main">
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarItem>
            <SidebarLink href="/dashboard" icon={<DashboardIcon />} active={path === "/dashboard"}>
              Dashboard
            </SidebarLink>
          </SidebarItem>
        </SidebarGroup>
      </SidebarNav>
    </SidebarContent>
  </Sidebar>
  <main>{children}</main>
</SidebarProvider>
```

Exports: `SidebarProvider`, `useSidebar`, `Sidebar`, `SidebarBadge`, `SidebarCollapse`, `SidebarTrigger`, `SidebarOverlay`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarNav`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarItem`, `SidebarLink`. Exported types: `SidebarProviderProps`, `SidebarProps`, `SidebarLinkProps`, `SidebarBadgeProps`, `SidebarCollapseProps`, and related `*ClassNames` types.


## Sheet

Compound sheet primitives for edge-sliding panels. See the [Sheet](/docs/sheet) docs page for props and exported types.

```tsx
import {
  Button,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@rfdtech/components";

<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button variant="secondary">Open filters</Button>
  </SheetTrigger>
  <SheetPortal>
    <SheetOverlay />
    <SheetContent side="right" showCloseButton>
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>Refine the results below.</SheetDescription>
      </SheetHeader>
      <SheetBody>{children}</SheetBody>
      <SheetFooter>
        <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
        <Button onClick={() => setOpen(false)}>Apply</Button>
      </SheetFooter>
    </SheetContent>
  </SheetPortal>
</Sheet>
```

Props: `Sheet` — `open`, `defaultOpen`, `onOpenChange`. `SheetContent` — `side`, `showCloseButton`, `classNames`, `className`. Layout parts support part-level `classNames`. Exported types: `SheetSide`, `SheetOverlayProps`, `SheetContentProps`, `SheetHeaderProps`, `SheetTitleProps`, `SheetDescriptionProps`, `SheetBodyProps`, `SheetFooterProps`, and related `*ClassNames` interfaces.


## Sortable

Reorderable list primitive with optional drag handles and keyboard support. See the [Sortable](/docs/sortable) docs page for props and exported types.

```tsx
import { useState } from "react";
import {
  Sortable,
  SortableHandle,
  SortableItem,
  SortableList,
} from "@rfdtech/components";

const [items, setItems] = useState(["alpha", "beta", "gamma"]);

<Sortable items={items} onReorder={setItems}>
  <SortableList>
    {items.map((id) => (
      <SortableItem key={id} id={id}>
        <SortableHandle aria-label={`Reorder ${id}`} />
        <span>{id}</span>
      </SortableItem>
    ))}
  </SortableList>
</Sortable>
```

Exports: `Sortable`, `SortableList`, `SortableItem`, `SortableHandle`, `reorderItems`. Types: `SortableProps`, `SortableListProps`, `SortableItemProps`, `SortableHandleProps`, `SortableId`, `SortableStrategy`, `SortableClassNames`.


## Tabs

Compound tabs primitives for switching between related panels. See the [Tabs](/docs/tabs) docs page for props and exported types.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rfdtech/components";

<Tabs defaultValue="account" variant="line">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings</TabsContent>
  <TabsContent value="security">Security settings</TabsContent>
</Tabs>
```

Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Props: `Tabs` — `value`, `defaultValue`, `onValueChange`, `orientation`, `activationMode`, `variant`, `classNames`, `className`, `children`. `TabsTrigger` — `value`, `disabled`, `classNames`, `className`. Exported types: `TabsProps`, `TabsListProps`, `TabsTriggerProps`, `TabsContentProps`, `TabsVariant`, `TabsClassNames`, `TabsListClassNames`, `TabsTriggerClassNames`, `TabsContentClassNames`.


## Toast

Transient notifications with an imperative `useToast` hook, powered by Sonner. See the [Toast](/docs/toast) docs page for props and exported types.

```tsx
import { CheckCircle2 } from "lucide-react";
import { ToastProvider, Toaster, useToast } from "@rfdtech/components";

<ToastProvider>
  <App />
  <Toaster />
</ToastProvider>

const { toast } = useToast();

toast({
  title: "Profile saved",
  description: "Your changes were applied.",
  variant: "success",
  icon: <CheckCircle2 size={18} strokeWidth={2} aria-hidden />,
});
```

Exports: `ToastProvider`, `Toaster`, `useToast`. Types: `ToastOptions`, `ToastVariant`, `ToastProviderProps`, `ToasterProps`, `UseToastReturn`, `ToastClassNames`, `ToastAction`, `ToastReturn`.


## Development

```bash
npm install
npm run demo        # Start demo at http://localhost:5173 — interactive examples at / and MDX docs at /docs
npm run test        # Run unit and component tests
npm run test:watch  # Run tests in watch mode
npm run build       # Build library to dist/
npm run typecheck
```

The demo reads credentials from environment variables:

```bash
VITE_API_BASE_URL=https://api.example.com VITE_ACCESS_TOKEN=<token> npm run demo
```

Leave `VITE_API_BASE_URL` unset to use the built-in mock API at `/v1/me/apps`.

## License

MIT
