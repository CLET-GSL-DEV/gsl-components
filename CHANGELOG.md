# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2026-06-17

### Added

- `Table` component with debounced search, filter popover, sortable columns, sort arrow indicators, pagination controls, row selection with select-all/indeterminate checkbox, and data-driven content rendering via `TableColumn[]`
- `AppHeader` — compound header with `AppHeaderSearch`, `AppHeaderActions`, `AppHeaderNotifications`, and `AppHeaderProfile` sub-components
- `AppHeaderSearch` — data-driven search using `Command` primitives; `data` prop (groups of items with `label: ReactNode`), debounced `onSearch` for tanstack query integration, `showEmpty`/`emptyLabel` for no-results state, `children` for custom list content; list rendering memoized on `[data]`
- `AppHeaderNotifications` — bell trigger → Radix popover with loading skeleton (pulse animation), `loadingLabel` prop for accessible loading state, and consumer-rendered notification items
- `AppHeaderProfile` `variant` prop — `"full"` (default, large centered 64px avatar + email + carded actions) and `"basic"` (compact 32px inline avatar with name/role row, flat actions, `max-content` width, opens flush with trigger, no email)
- `AppLayout`, `AppSidebar`, `AppBody` — layout container that auto-positions children by component type
- `CountrySelector` — country dropdown with flag emoji, search filtering, `invalid`/`disabled` states
- `DateSelector` — date picker with calendar grid popover, month/year navigation, native date formatting
- `MetricCard` — metric display card with label, value, optional icon/description, and trend indicator (up/down/neutral)
- `NetworkOperator` — operator selector with image thumbnails (MTN, Vodafone, AirtelTigo, Glo), `defaultValue` prop, `invalid`/`disabled` states
- `OtpInput` — OTP input with configurable length, paste-from-any-slot support, keyboard navigation, `onComplete` callback, and forwardRef for react-hook-form
- `PhoneNumberInput` — phone input with country code selector (flag + dial code), auto-detection of country from phone number prefix
- `UploadField` — file upload with drag-and-drop zone, file type icons (PDF/image/video/generic), remove button, `invalid`/`disabled` states
- `Dropdown` — gained `invalid` prop and `aria-invalid` support
- `Card` — surface wrapper with `header` slot, `--gsl-surface-card` background, `--gsl-card-padding` token, and `CardClassNames`
- `DateRangeSelector` — date range picker with linked From/To inputs, shared calendar, range highlighting, controlled/uncontrolled value
- `SidebarBrand` — compound sub-component for sidebar brand area, auto-hides on collapse
- `useTableFilter` hook — URL search-param based filter state with `paramPrefix` support
- `useTablePagination` hook — URL search-param based pagination (`page`, `pageSize`) with `react-router-dom`
- `useTableState` hook — URL search-param based table state (search, pagination, sort, filter) with `react-router-dom`
- `useDebounce` hook for generic debounced values
- `DocsLayout` component for documentation pages (split from `DemoLayout`)
- `countries` utility — full country list with name, flag emoji, dial code, ISO code
- CSS tokens `--gsl-surface-dark`, `--gsl-surface-card`, `--gsl-rounded-base` (replaces `--gsl-radius`), `--gsl-radius-xl`, `--gsl-radius-2xl`
- `AppHeader` doc page with compound component docs, design token reference, and all sub-components
- `AppLayout` doc page with layout diagram, auto-positioning docs, and design tokens
- `Card`, `CountrySelector`, `DateSelector`, `DateRangeSelector`, `NetworkOperator`, `OtpInput`, `PhoneNumberInput`, `UploadField` doc pages with interactive examples and react-hook-form usage sections
- Tests for `CountrySelector`, `NetworkOperator`, `AppHeader` (all sub-components), `AppLayout`, `Card` — all with RHF integration coverage

### Changed

- Sidebar uses `--gsl-radius-2xl` for border-radius and `--gsl-surface-dark` for hover/active states
- Table search shows clear `×` button when non-empty; filter trigger shows active-count badge when `activeCount > 0`
- Table pagination right-aligned in footer, shows "Showing X–Y of Z" when `totalItems` provided
- `DemoLayout` simplified to accept header/sidebar/children slots; `DocsPage` uses `DocsLayout`
- Demo page split into `DemoPage` (dashboard) + `MembersPage` (CRUD table with modals)
- AppHeaderProfile popover uses `--gsl-primary` bg + `--gsl-on-primary` text for avatar (was `--gsl-surface-subtle` with border)
- AppHeader uses full width and falls back to `1rem` for `--gsl-app-layout-body-gap` when used outside AppLayout
- `AppHeaderActionsProps` moved to centralized `src/types/app-header.ts`
- UploadField disabled drop zone shows `cursor: not-allowed`
- `AppSidebar` renders as `<aside>` with ref forwarding (was raw Fragment)
- `CountrySelector`, `NetworkOperator`, `AppHeader`, and `AppLayout` now have full test suites with react-hook-form integration coverage
- Table pagination shows "Showing {start} to {select} of {total}" with inline page-size dropdown
- Table `paramPrefix` now required on `<Table>`
- CommandGroup loading replaced with 3-row skeleton (was thin loading bar)
- SidebarContent scrollbar hidden; scroll hint button and gradient overlays internalized to component
- Sidebar links show `title` tooltip when collapsed
- `--gsl-radius` token renamed to `--gsl-rounded-base`
- Design tokens sections on docs pages now only list component-specific tokens
- Bulk-import template download removed
- Demo sidebar footer opens Modal with DateRangeSelector playground

### Removed

- `Select` component removed (redundant with `Dropdown`)


## [1.8.0] - 2026-06-15

### Changed

- Form docs split into `/docs/form` (Field, Input, Textarea) and `/docs/form-field` (Form, FormField, useFormField, Zod)
- Dialog, Modal, BulkImportModal, and CommandDialog doc examples and README snippets now use `useDialogSearchParam` / `useModalSearchParam` for URL-driven open state
- Toast rebuilt on [Sonner](https://sonner.emilkowal.ski/) — `ToastProvider`, `Toaster`, and `useToast()` remain the public API; internal queue and styling now delegate to Sonner with GSL `unstyled` class names
- `useToast().toasts` is deprecated and always returns `[]` (Sonner does not expose its queue)
- Docs code examples use increased spacing between fenced blocks and inside highlighted code panels

### Removed

- Toast compound Radix parts: `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `ToastViewport`, `ToastIcon`
- Toast reducer utilities: `toastReducer`, `createToastRecord`, `enforceToastLimit`, `TOAST_REMOVE_DELAY`, `createToastId`
- `ToastProvider` props `swipeDirection` and `label` (not supported by Sonner)

### Added

- `Field` compound primitives (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldControl`) for accessible label, helper, and error wiring
- `Input` and `Textarea` forwardRef controls styled for GSL forms
- `Form`, `FormField`, and `useFormField` adapters for optional `react-hook-form` integration (peer dependency)
- Form documentation page at `/docs/form` for `Field`, `Input`, and `Textarea` primitives
- FormField documentation page at `/docs/form-field` for `Form`, `FormField`, `useFormField`, and Zod validation
- `zod` and `@hookform/resolvers` documented as optional peer dependencies for schema validation
- `ToastOptions.icon` for optional leading icons with variant-tinted styling
- `Draggable` compound primitives (`Draggable`, `DraggableHandle`) and `useDraggable` hook for repositioning panels within parent, window, or custom bounds
- Draggable documentation page at `/docs/draggable` with props and exported types
- `Sortable` compound primitives (`Sortable`, `SortableList`, `SortableItem`, `SortableHandle`) and `reorderItems` helper for list reordering via `@dnd-kit`
- Sortable documentation page at `/docs/sortable` with props and exported types
- `Toast` primitives (`ToastProvider`, `Toaster`) and `useToast` hook for imperative notifications
- Toast documentation page at `/docs/toast` with props and exported types

## [1.7.0] - 2026-06-15

### Added

- `Sidebar` compound primitives (`SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarOverlay`, nav parts) with mobile offcanvas drawer
- `SidebarCollapse` desktop collapse toggle and `SidebarLink` `icon` prop for icon + label rows
- `SidebarBadge` trailing pill for link counts and labels
- `Command` compound primitives (`Command`, `CommandDialog`, input/list/item parts) built on cmdk
- `CommandDialog` `shortcut` prop and `useCommandShortcut` hook for Cmd/Ctrl+K palette toggle
- `CommandShortcut` trailing key hint chip for command items
- `CommandInput` search icon and optional shortcut badge (inherits from `CommandDialog` when `shortcut` is set)
- `CommandGroup` `loading` and `loadingLabel` props for per-group async result loading
- `formatCommandShortcutLabels` helper and `useCommandDialog` hook
- `Dialog` compound primitives (`Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose`) built on Radix Dialog
- `Modal` compound primitives (`Modal`, `ModalTrigger`, `ModalPortal`, `ModalOverlay`, `ModalContent`, `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter`, `ModalClose`) for near full-viewport shell layouts
- `Sheet` compound primitives (`Sheet`, `SheetTrigger`, `SheetPortal`, `SheetOverlay`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetBody`, `SheetFooter`, `SheetClose`) for edge-sliding panels with `side` (`top`, `right`, `bottom`, `left`)
- `Badge` component with semantic variants (`default`, `primary`, `success`, `warning`, `error`, `outline`) and `sm` / `md` sizes
- `Breadcrumb` compound primitives (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`) for hierarchical navigation trails
- `ProgressBar` component with semantic variants (`default`, `success`, `warning`, `error`), `sm` / `md` sizes, and determinate / indeterminate modes
- Hooks module: `useSearchParamOverlay`, `useDialogSearchParam`, and `useModalSearchParam` for URL search-param overlay state with flat prefixed data params (`dialog.userId`, etc.), `data`, `openWith`, and `SearchParamOverlayState`; includes `createSearchParamAdapter`, `createBrowserSearchParamAdapter`, and `readOverlayData` / `writeOverlayData` / `clearOverlayData` utilities
- Dialog documentation page at `/docs/dialog` with props and exported types
- Modal documentation page at `/docs/modal` with props and exported types
- Sheet documentation page at `/docs/sheet` with props and exported types
- Badge documentation page at `/docs/badge` with props and exported types
- Breadcrumb documentation page at `/docs/breadcrumb` with props and exported types
- ProgressBar documentation page at `/docs/progress-bar` with props and exported types
- Hooks documentation page at `/docs/hooks` with URL overlay examples and adapter patterns
- Sidebar documentation page at `/docs/sidebar` with props and exported types
- Command documentation page at `/docs/command` with props and exported types

### Changed

- Sidebar desktop appearance: card panel with neutral active state and collapsible icon rail
- Command inline results render in a floating popover so the search field height stays fixed
- Command shortcut badges use a single unified chip (e.g. `⌘` `K`) instead of separate key caps per key
- Command dialog input shows the keyboard shortcut badge automatically when `shortcut` is set
- Component authoring rule requires full responsive behavior (320px–desktop, touch targets, reduced motion, docs preview checks)

## [1.5.0] - 2026-06-15

### Added

- `RadioGroup` and `Radio` components with optional labels and part-level `classNames`
- RadioGroup documentation page at `/docs/radio-group` with props and exported types
- `Radio.description` for optional secondary text under each option label
- `RadioGroup.variant="card"` choice card layout with bordered selectable surfaces
- `Tabs` compound primitives (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) with `default` and `line` variants
- Tabs documentation page at `/docs/tabs` with props and exported types

### Changed

- Tabs panels animate in with a fade and slide on tab switch; disabled when `prefers-reduced-motion: reduce` is set
- Line variant tabs use a sliding underline indicator instead of per-trigger borders
- Docs nav, README component sections, and `src/index.ts` exports list components alphabetically
- Component authoring rule requires alphabetical ordering when adding components to nav, README, and exports

## [1.4.0] - 2026-06-14

### Added

- `Button` component with primary, secondary, outline, and ghost variants, loading spinner, and disabled state
- `ButtonClassNames` and `classNames` prop for part-level Tailwind/class overrides (`root`, `label`, `spinner`)
- Button documentation page at `/docs/button` with props and exported types
- `Checkbox` component with optional label and part-level `classNames`
- Checkbox documentation page at `/docs/checkbox` with props and exported types
- `Dropdown` select-style component with clearable support and part-level `classNames`
- Dropdown documentation page at `/docs/dropdown` with props and exported types
- `Popover` compound primitives (`Popover`, `PopoverTrigger`, `PopoverContent`, etc.) with styled content surface
- Popover documentation page at `/docs/popover` with props and exported types
- Cursor rule `.cursor/rules/gsl-component-authoring.mdc` for component conventions

### Changed

- Radix UI packages moved from peer dependencies to dependencies so a single `npm install @rfdtech/components` is sufficient
- `FieldMappingSelect` in BulkImportModal now wraps the public `Dropdown` component
- Dropdown trigger uses Lucide `ChevronDown` instead of a text glyph; adds `lucide-react` as a dependency
- Popover docs example demonstrates an action menu pattern with `PopoverClose`; adds menu utility classes (`gsl-popover--menu`, `gsl-popover__menu`, `gsl-popover__menu-item`)
- AppSwitcher app icons render image URLs as round cropped icons
- `AppSwitcher` is data-only: pass `apps` directly and control loading with the `loading` prop; panel shows a Lucide spinner while loading

### Removed

- `AppSwitcher` remote fetch via `baseUrl` / `accessToken`
- `useMeApps`, `fetchMeApps`, `MeAppsFetchError`, `buildMeAppsUrl`, `createMeAppsRequestInit`, `mapMeAppToAppItem`, `mapMeAppsToAppItems`
- `MeApp`, `MeAppsResponse`, `UseMeAppsOptions`, `UseMeAppsReturn`, and `AppItem.metadata`

## [1.3.0] - 2026-06-14

### Added

- `ThemeProvider` and `useTheme()` for light, dark, and system themes
- Layered theme CSS (`base`, `light`, `dark`) with shared z-index tokens
- Theme documentation page at `/docs/theme`

### Changed

- Theme CSS loads once from the library entry instead of per-component imports
- `ThemeProvider` syncs `data-gsl-theme` to `document.documentElement` so portaled modals and popovers inherit the active palette

## [1.2.0] - 2026-06-14

### Added

- Radix UI primitives as peer dependencies (`@radix-ui/react-popover`, `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-select`, `@radix-ui/react-radio-group`, `@radix-ui/react-slot`)

### Changed

- `AppSwitcher` now uses `@radix-ui/react-popover` for the app grid panel
- `BulkImportModal` now uses `@radix-ui/react-dialog` and `@radix-ui/react-alert-dialog` for the modal shell and exit confirmation
- Column mapping in `BulkImportModal` uses `@radix-ui/react-select`
- Header row selection uses `@radix-ui/react-radio-group`

### Removed

- Custom popover, dialog, and field-mapping dropdown implementations replaced by Radix primitives

## [1.0.3] - 2026-06-12

### Added

- Changelog page in docs (`/docs/changelog`) and root `CHANGELOG.md`

## [1.0.2] - 2026-06-12

### Added

- `DataTable` component with column sorting, pagination, loading state, and empty state
- `Pagination` component (standalone; composed by `DataTable`)
- Interactive documentation site at `/docs` with MDX pages, syntax highlighting, and preview/code tabs
- Demo app routing split into Demo and Docs pages with a sectioned docs sidebar

### Changed

- `DataTable` is static-only: parents pass `data` and control fetching with a `loading` prop (async `loadData` removed)
- Demo app refactored into `DemoPage` and `DocsPage` with shared `DemoLayout`

## [1.0.0] - 2026-06-11

### Added

- `Dropdown` single-value select component
- `DropdownMenu` action menu component
- `Combobox` async search component with debounced `loadOptions`
- `prepublishOnly` script to run typecheck, tests, and build before publishing

### Changed

- `BulkImportModal` column mapping uses an internal field-mapping dropdown
- README expanded with component usage and style import instructions

### Removed

- `Dropdown`, `Combobox`, `DropdownMenu`, `DataTable`, and `Pagination` components

## [0.4.0] - 2026-06-11

### Added

- `AppSwitcher` component for switching between GSL systems
- `BulkImportModal` multi-step import flow with editable rows and exit confirmation

### Changed

- Package renamed to `@rfdtech/components`
- Bulk import stepper animations, accessibility, and responsive styling improvements
