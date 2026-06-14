# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
