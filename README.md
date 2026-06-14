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

## AppSwitcher

Google Apps–style 9-dot launcher for switching between GSL systems. Drop it into your header to let users jump between products.

### Usage

**Remote fetch** — loads systems from `GET {baseUrl}/v1/me/apps` with a bearer token:

```tsx
import { AppSwitcher } from "@rfdtech/components";

function Header({ baseUrl, accessToken }: { baseUrl: string; accessToken: string }) {
  return (
    <AppSwitcher
      baseUrl={baseUrl}
      accessToken={accessToken}
      title="System directory"
      onAppSelect={(app) => console.log(app.name, app.metadata)}
    />
  );
}
```

Expected API response:

```json
{
  "success": true,
  "message": "Available systems retrieved.",
  "data": {
    "apps": [
      {
        "system_id": "gov-portal",
        "system_name": "Governance Portal",
        "system_code": "GOV-123456",
        "frontend_url": "http://178.105.154.224:3001",
        "role": "registrar",
        "permissions": ["cases:review"]
      }
    ]
  },
  "meta": { "count": 1 }
}
```

**Static apps** — pass a list directly instead of fetching:

```tsx
const apps = [
  {
    id: "mail",
    name: "Mail",
    icon: "https://example.com/mail.png",
    href: "https://mail.example.com",
  },
];

<AppSwitcher apps={apps} title="System directory" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apps` | `AppItem[]` | — | Static apps to show in the grid |
| `baseUrl` | `string` | required* | API base URL, e.g. `https://api.example.com` |
| `accessToken` | `string` | required* | Bearer access token |
| `columns` | `number` | `3` | Number of grid columns |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Open state callback |
| `onAppSelect` | `(app: AppItem) => void` | — | Called when an app is selected |
| `triggerLabel` | `string` | `"Open app switcher"` | Accessible label for trigger |
| `trigger` | `ReactNode` | 9-dot icon | Custom trigger element |
| `title` | `string` | — | Panel header title |
| `footer` | `ReactNode` | — | Footer content below the grid |
| `placement` | `"bottom-end" \| "bottom-start" \| "bottom"` | `"bottom-end"` | Panel position |
| `closeOnSelect` | `boolean` | `true` | Close panel after selection |
| `className` | `string` | — | Root CSS class |
| `style` | `CSSProperties` | — | Root inline styles |

\* Required when `apps` is not provided.

### Types

All types are exported from `@rfdtech/components`.

```ts
interface AppItem {
  id: string;
  name: string;
  icon: ReactNode | string;
  href?: string;
  onClick?: (app: AppItem) => void;
  disabled?: boolean;
  badge?: string;
  metadata?: MeApp;
}

interface MeApp {
  system_id: string;
  system_name: string;
  system_code: string;
  frontend_url: string;
  role: string;
  permissions: string[];
}

interface MeAppsResponse {
  success: boolean;
  message: string;
  data: { apps: MeApp[] };
  meta: { count: number };
}
```

Also exported: `AppSwitcherProps`, `UseMeAppsOptions`, `UseMeAppsReturn`, `UseAppSwitcherOptions`, `UseAppSwitcherReturn`.

### Hooks

**`useMeApps`** — fetch and map systems from `/v1/me/apps`:

```tsx
import { useMeApps } from "@rfdtech/components";

const { apps, loading, error, refetch } = useMeApps({
  baseUrl: "https://api.example.com",
  accessToken: "<token>",
});
```

**`useAppSwitcher`** — headless open/close state for custom UI:

```tsx
import { useAppSwitcher } from "@rfdtech/components";

const { open, toggle, close, triggerRef, panelRef } = useAppSwitcher();
```

### Utilities

```tsx
import {
  buildMeAppsUrl,
  createMeAppsRequestInit,
  fetchMeApps,
  mapMeAppToAppItem,
  mapMeAppsToAppItems,
  MeAppsFetchError,
} from "@rfdtech/components";

const url = buildMeAppsUrl("https://api.example.com");
const init = createMeAppsRequestInit("<token>");
const response = await fetchMeApps(url, init);
const apps = mapMeAppsToAppItems(response.data.apps);
```

| Export | Description |
|--------|-------------|
| `buildMeAppsUrl(baseUrl)` | Builds `{baseUrl}/v1/me/apps`, or `/v1/me/apps` when `baseUrl` is empty |
| `createMeAppsRequestInit(accessToken)` | Returns fetch options with `Authorization: Bearer ...` |
| `fetchMeApps(url, init?)` | Fetches and validates the API response; throws `MeAppsFetchError` on failure |
| `mapMeAppToAppItem(app)` | Maps one `MeApp` to an `AppItem` |
| `mapMeAppsToAppItems(apps)` | Maps an array of `MeApp` values to `AppItem[]` |
| `MeAppsFetchError` | Error thrown when the HTTP request fails or `success` is `false` |

### Subcomponents

Also exported for custom layouts:

- `AppSwitcherItem` — single app grid cell
- `GridIcon` — default 9-dot trigger icon
- `SystemAppIcon` — initials avatar for API-fetched apps

### Theming

Override shared tokens on `.gsl-app-switcher` (see [Shared theming](#shared-theming)). `--gsl-focus` aliases to `--gsl-primary`.

```css
.my-switcher {
  --gsl-primary: #dc2626;
  --gsl-hover: #f1f3f4;
  --gsl-columns: 4;
}
```

### CORS

When fetching from a remote `baseUrl` in the browser, the API must allow the host application's origin. Configure CORS on your backend or proxy `/v1` through your dev server during local development.

## BulkImportModal

Four-step modal wizard for importing spreadsheet data (.xlsx, .xls, .csv). Parsing and validation run entirely in the browser.

### Usage

```tsx
import { BulkImportModal } from "@rfdtech/components";

const fields = [
  { key: "email", label: "Email", required: true },
  { key: "full_name", label: "Full name", required: true },
  { key: "student_id", label: "Student ID" },
];

<BulkImportModal
  open={open}
  onOpenChange={setOpen}
  title="Import students"
  fields={fields}
  onComplete={(result) => {
    console.log(result.rows, result.errors);
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
