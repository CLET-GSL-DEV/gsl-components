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
      { slug: "theme", title: "Theme" },
      { slug: "changelog", title: "Changelog" },
    ],
  },
  {
    title: "Components",
    items: [
      { slug: "button", title: "Button" },
      { slug: "app-switcher", title: "AppSwitcher" },
      { slug: "bulk-import-modal", title: "BulkImportModal" },
    ],
  },
];
