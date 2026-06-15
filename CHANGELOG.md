# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `Sidebar` compound primitives (`SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarOverlay`, nav parts) with mobile offcanvas drawer
- `SidebarCollapse` desktop collapse toggle and `SidebarLink` `icon` prop for icon + label rows
- `SidebarBadge` trailing pill for link counts and labels
- `Command` compound primitives (`Command`, `CommandDialog`, input/list/item parts) built on cmdk
- `CommandDialog` `shortcut` prop and `useCommandShortcut` hook for Cmd/Ctrl+K palette toggle
- `CommandShortcut` trailing key hint for command items
- Sidebar documentation page at `/docs/sidebar` with props and exported types
- Command documentation page at `/docs/command` with props and exported types

### Changed

- Sidebar desktop appearance: card panel with neutral active state and collapsible icon rail
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
