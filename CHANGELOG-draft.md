# Changelog Draft

## [Unreleased]

### Added

1. `Table` — debounced search, filter popover, sortable columns with arrow indicators, pagination controls, data-driven content via `TableColumn[]`
2. `AppHeader` — composable header with `search`, `appSwitcher`, `notifications`, `profile` slot props
3. `AppHeaderSearch` — data-driven search using `Command` primitives; `data` prop (groups of items with `label: ReactNode`), debounced `onSearch` for tanstack query, `showEmpty`/`emptyLabel`, `children` in list; list rendering memoized on `[data]`
4. `AppHeaderNotifications` — bell trigger → Radix popover with loading skeleton (pulse animation) and consumer-rendered items
5. `AppHeaderProfile` `variant` prop — `"full"` (default, large centered avatar + email + carded actions) and `"basic"` (compact 32px inline avatar + name/role, flat actions, `max-content` width, opens flush with trigger, no email)
6. `AppLayout`, `AppSidebar`, `AppBody` — layout container that auto-positions children by component type
7. `CountrySelector` — country dropdown with flag emoji, search filtering, `invalid`/`disabled` states
8. `DateSelector` — date picker with calendar grid popover, month/year navigation, native date formatting
9. `MetricCard` — metric display card with label, value, optional icon/description, and trend indicator (up/down/neutral)
10. `NetworkOperator` — operator selector with image thumbnails (MTN, Vodafone, AirtelTigo, Glo), `invalid`/`disabled`
11. `OtpInput` — OTP input with configurable length, paste-from-any-slot, keyboard navigation, `onComplete`, forwardRef
12. `PhoneNumberInput` — phone input with country code selector (flag + dial code), auto-detection from prefix
13. `UploadField` — file upload with drag-and-drop, file type icons (PDF/image/video/generic), remove, `invalid`/`disabled`
14. `Select` — Radix-based select with `options` array, `placeholder`, `invalid`/`disabled`, forwardRef
15. `Dialog` compound primitives (`Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose`) on Radix Dialog
16. `useTablePagination` — URL search-param based pagination (`page`, `pageSize`) with `react-router-dom`
17. `useTableState` — URL search-param based table state (search, pagination, sort, filter) with `react-router-dom`
18. `useDebounce` — generic debounce hook
19. `DocsLayout` — documentation page layout (split from `DemoLayout`)
20. `countries` utility — full country list with name, flag emoji, dial code, ISO code
21. CSS tokens `--gsl-surface-dark`, `--gsl-radius-xl`, `--gsl-radius-2xl`
22. All app-header types centralized in `src/types/app-header.ts`
23. Types for all new components in `src/types/`
24. `MembersPage` demo — full CRUD table with view/edit modals, bulk import, search/filter/sort/pagination via `useTableState`
25. `useMockQuery` demo hook — simulated async queries with configurable delay

### Changed

1. Sidebar uses `--gsl-radius-2xl` for border-radius and `--gsl-surface-dark` for hover/active states
2. Table search shows clear `×` button when non-empty
3. Table filter trigger shows active-count badge when `activeCount > 0`
4. Table pagination right-aligned in footer, shows "Showing X–Y of Z" when `totalItems` provided
5. AppHeaderProfile popover avatar uses `--gsl-primary` bg + `--gsl-on-primary` text (was `--gsl-surface-subtle` with border)
6. AppHeaderProfile `"basic"` variant opens `side="top"` with `sideOffset={0}`, animates upward
7. Notification popover body scrollbar hidden (`scrollbar-width: none`)
8. `DemoLayout` simplified to accept header/sidebar/children slots; `DocsPage` uses `DocsLayout`
9. Demo page split into `DemoPage` (dashboard) + `MembersPage` (CRUD table with modals)
