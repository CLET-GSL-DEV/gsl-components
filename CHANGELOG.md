# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.18.0] - 2026-06-21

### Breaking
- **AppLayout**: Now wraps `SidebarProvider` and `BreadcrumbProvider` internally. Consumers no longer need to add these providers. Removed `AppBreadcrumb` slot component. Breadcrumbs are context driven, call `useBreadcrumbs()` from any page to set them.
- **Card**: Removed `header` prop and `CardClassNames`. Use `CardHeader`, `CardTitle`, and `CardActions` sub-components instead.

### Added
- `BreadcrumbProvider`, `useBreadcrumbs`, `useBreadcrumbContext`, `BreadcrumbEntry` exports
- `CardHeader`, `CardTitle`, `CardActions` sub-components
- `useConfirmBeforeUnload` hook for browser `beforeunload` confirmation
- BulkImportModal: browser confirmation prompt when a file has been uploaded but not confirmed
- BulkImportModal: reset discarded rows button on validate data page

### Changed
- **ValidateDataStep**: replaced `<Table />` dependency with an internal virtualized table using `@tanstack/react-virtual`. Error counts correctly exclude discarded rows.
- Minor CSS improvements across sidebar, button, modal, field, and table components

## [1.17.0] - 2026-06-20

### Added

- ModalContent `onOpenChange` prop for direct close handler passing
- BulkImportModal `defaultState` prop (`BulkImportFlowDefaultState`) for flow state preservation across open/close cycles
- BulkImportModal flow state types exported
- AppHeader: simplified wrapper with `as` prop for semantic flexibility
- AppLayout: className and extra props passthrough on layout wrappers
- SelectHeaderRowStep: responsive single-column header row selection with radio buttons on mobile
- Table: `TableHeaderCell` with `sortable`, `sortDirection`, `onSort` and sort icon; sticky `TableHeader`

### Changed

- ModalContent: removed nested AlertDialog for close-confirmation (all alert() debug calls cleaned out)
- UploadField: action button uses `<Button variant="primary">` instead of raw `<button>`
- BulkImportModal stepper: nav-based step indicator with clickable completed steps; footer/body use ModalFooter/ModalBody
- UploadField: action button height aligned with Button component sizing (36px → 40px)

### Fixed

- ModalContent: no nested Radix Dialog (caused focus-trap / z-index conflicts)
- BulkImportModal CSS lint: padding shorthand, rgba → rgb modern notation, ::last-child → :last-child
- ValidateDataStep memoization
- Modal test: close-button test updated

## [1.16.1] - 2026-06-19

### Added

- SidebarLink `to` prop: renders as react-router `<Link>` for client-side navigation

### Fixed

- **Peer dependency externalization** — `react-router-dom` and `lucide-react` were bundled inside the library, causing `useLocation()` crash when consuming app ran its own `BrowserRouter`. Both are now externalized from the build and declared as peer dependencies, so the library and app share a single copy from the consumer's node_modules.
- Tooltip arrow borders now face the correct direction per placement (top, bottom, left, right)

### Changed

- Moved `lucide-react` from `dependencies` to `peerDependencies` (consumer likely has it installed)

## [1.16.0] - 2026-06-19

### Added

- Tooltip component with top/right/bottom/left positioning, arrow indicator, and pure-CSS hover reveal
- SidebarLink tooltip on collapsed rail: shows label text on hover via Tooltip
- Modal size variants (`sm`, `md`, `lg`, `xl`, `2xl`) with independently customizable `--gsl-modal-max-width-*` tokens
- Modal `preventClose` prop: intercepts X, overlay click, and Escape; shows confirmation dialog via AlertDialog
- Modal centered layout with popover-style border and shadow
- AppBreadcrumb slot for breadcrumbs in AppLayout
- Avatar component with initials/name display and configurable size
- SidebarBadge now uses primary color tokens with overridable CSS variables

### Changed

- BreadcrumbLink: calls preventDefault on click for SPA safety, preserves consumer onClick
- BulkImportModal exit confirm: uses Button component instead of raw elements (fixes Cancel dismissal)
- Modal, Popover, App-switcher, Command dialog, Dropdown: unified border-radius to `--gsl-radius-xl` and box-shadow to `--gsl-shadow-md`
- AppLayout: passes className and extra props through to all layout wrappers
- AppHeader: simplified to passthrough container
- AppSidebar/AppBody: simplified to passthrough, layout classes moved to AppLayout wrappers
- Theme: adds --gsl-z-header token and body background

### Fixed

- Command inline popover: removed Portal wrapper so popover renders in-flow; adds pointer-events: none when closed to prevent blocking clicks

## [1.15.2] - 2026-06-19

### Added

- ThemeProvider `storageKey` prop: persists theme to localStorage across sessions

## [1.15.1] - 2026-06-19

### Changed

- Command: inline list now renders via Radix Popover portal, escaping all parent stacking contexts; z-index and positioning handled by Popover instead of absolute CSS

### Fixed

- Malformed CSS in table checkbox-cell and network-operator rules causing PostCSS "Unknown word" errors in consuming projects

### Added

- stylelint with `lint:css` / `lint:css:fix` scripts; wired into `prepublishOnly` to catch CSS syntax errors before publish

## [1.14.0] - 2026-06-18

### Changed

- CommandDialog overlay now fades in/out with animation, matching Dialog and Modal component patterns

## [1.13.2] - 2026-06-18

### Changed

- Toast: restyled with popover background, border, and shadow; action button uses Button secondary sm classes; close button is transparent ghost; title text matches semantic variant color; border-radius xl; glass background with backdrop blur

## [1.13.1] - 2026-06-18

### Added

- `PhoneNumberInput` Zod validation form example with success/failure dialog
- `UploadField` Zod validation form example with file type, min/max size, and name length checks

### Changed

- CommandDialog: border radius changed from xl to base; inline Command input uses xl
- CommandDialog input wrapper: focus outline now follows border radius
- UploadField Zod validation made stricter with minimum file size and filename length checks

### Cleanups

- Shortened all MDX page meta descriptions to 3--5 words for compact docs search results

### Fixes

- UploadField Zod form example: dialog styling matches PhoneNumberInput form pattern

## [1.13.0] - 2026-06-18

### Added

- `DateRangeSelector` year/month dropdown selectors for quick navigation
- `DateRangeSelector` Apply/Cancel confirmation buttons (pending range committed on Apply)
- `DateRangeSelector` side-by-side two-month calendar layout
- `DateRangeSelectorClassNames` keys: `calendarFooter`, `applyButton`, `cancelButton`

### Changed

- `DateRangeSelector` months/selects use project `Dropdown` component
- `DateRangeSelector` navigation and footer buttons use project `Button` component
- `--gsl-z-select` bumped from 1200 to 1400 for correct stacking inside popovers

## [1.12.0] - 2026-06-18

### Fixed

- TypeScript strict errors in `CodeFigure`, `PopoverExample`, `SidebarExample`, `SortableExample`, and `DateRangeSelector.test`
- Export `DateRangeValue` type from `DateRangeSelector` component module
- `onReorder` callback type compatibility in `Sortable` example
- Union type destructuring for optional `destructive` and `badge` props in docs examples

### Changed

- Replace native inputs with internal `Input` component across `Table`, `ValidateDataStep`, `ThemeToggle`
- Rename `--gsl-rounded-base` token back to `--gsl-radius-base`
- Date pickers use `--gsl-z-dropdown` token instead of dedicated `--gsl-z-datepicker`
- Refactor `DateRangeSelector` and `UploadField` design
- Add uncontrolled/RHF tests for all input components

## [1.11.0] - 2026-06-18

### Added

- UploadField docs: Zod file validation section with `z.instanceof(File)`, `.refine()` for type/size, and multi-file array example

## [1.10.0] - 2026-06-18

## [1.9.0] - 2026-06-17

### Added

- `AppHeader` compound primitives (`AppHeader`, `AppHeaderActions`, `AppHeaderSearch`, `AppHeaderNotifications`, `AppHeaderProfile`)
- `AppLayout`, `AppSidebar`, `AppBody` layout container with auto-positioning by `componentId`
- `Table` compound primitives (`Table`, `TableHeader`, `TableSearch`, `TableFilter`, `TableContent`, `TableFooter`, `TablePagination`) with URL-driven state; `paramPrefix` required; pagination shows "Showing {start} to {select} of {total}"
- `CountrySelector`, `DateSelector`, `DateRangeSelector`, `MetricCard`, `NetworkOperator`, `OtpInput`, `PhoneNumberInput`, `UploadField` input components
- `Card` surface wrapper (`header`, `body`, `--gsl-surface-card`, `--gsl-card-padding`)
- `SidebarBrand` sub-component for collapsed-aware brand area
- `useTablePagination`, `useTableState`, `useTableFilter`, `useDebounce` hooks
- `DocsLayout` for documentation pages
- `countries` utility — country list with name, flag emoji, dial code, ISO code
- CSS tokens `--gsl-surface-dark`, `--gsl-surface-card`, `--gsl-rounded-base`
- Documentation pages for all new components with interactive examples

### Changed

- Sidebar uses `--gsl-radius-2xl` and `--gsl-surface-dark` for active states; scrollbar hidden; scroll hint internalized
- CommandGroup loading replaced with skeleton rows
- `--gsl-radius` renamed to `--gsl-rounded-base`
- Added `invalid` prop and `aria-invalid` to `Dropdown`
- `DemoLayout` and demo pages refactored for new components
- `DateRangeSelector` refactored to single-trigger display with two-click range selection; start always kept before end (auto-swap); self-contained CSS; simplified `placeholder` prop from `{ start, end }` object to `string`


## [1.8.0] - 2026-06-15

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
