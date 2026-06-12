export interface DocNavItem {
  slug: string;
  title: string;
}

export interface DocNavSection {
  title: string;
  items: DocNavItem[];
}

export const docNavSections: DocNavSection[] = [
  {
    title: "Guide",
    items: [
      { slug: "getting-started", title: "Getting started" },
      { slug: "changelog", title: "Changelog" },
    ],
  },
  {
    title: "Components",
    items: [
      { slug: "app-switcher", title: "AppSwitcher" },
      { slug: "dropdown", title: "Dropdown" },
      { slug: "input-mask", title: "InputMask" },
      { slug: "combobox", title: "Combobox" },
      { slug: "data-table", title: "DataTable" },
      { slug: "pagination", title: "Pagination" },
      { slug: "dropdown-menu", title: "DropdownMenu" },
      { slug: "bulk-import-modal", title: "BulkImportModal" },
    ],
  },
];
